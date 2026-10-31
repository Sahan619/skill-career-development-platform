
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const Skill = require('./models/Skill');
const Progress = require('./models/Progress');
const CareerPath = require('./models/CareerPath');
const Project = require('./models/Project');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { GoogleGenAI } = require('@google/genai');
const connectDB = require('./config/db');
const User = require('./models/User');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only JPG, PNG, and WebP images are allowed.'));
    }

    callback(null, true);
  },
});

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

const PORT = process.env.PORT || 5000;

const getSafeErrorDetails = (error) => {
  const errorObject =
    error && typeof error === 'object' ? error : {};
  const secrets = [
    process.env.GEMINI_API_KEY,
    process.env.MONGO_URI,
    process.env.JWT_SECRET,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].filter((secret) => typeof secret === 'string' && secret.length > 0);
  let message =
    error instanceof Error ? error.message : String(error);

  for (const secret of secrets) {
    message = message.split(secret).join('[REDACTED]');
  }

  return {
    name:
      typeof errorObject.name === 'string' ? errorObject.name : 'Error',
    status:
      typeof errorObject.status === 'number'
        ? errorObject.status
        : undefined,
    code:
      typeof errorObject.code === 'string' ||
      typeof errorObject.code === 'number'
        ? errorObject.code
        : undefined,
    message: message
      .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED]')
      .replace(/\bBearer\s+\S+/gi, 'Bearer [REDACTED]')
      .slice(0, 1000),
  };
};

app.get('/', (req, res) => {
  res.send('Skill and Career Development API is running');
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail,
    }).collation({
      locale: 'en',
      strength: 2,
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof email !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).collation({
      locale: 'en',
      strength: 2,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET PROFILE
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROFILE
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      university,
      degree,
      studyYear,
      careerGoal,
      github,
      linkedin,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;
    user.university = university;
    user.degree = degree;
    user.studyYear = studyYear;
    user.careerGoal = careerGoal;
    user.github = github;
    user.linkedin = linkedin;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        degree: user.degree,
        studyYear: user.studyYear,
        careerGoal: user.careerGoal,
        github: user.github,
        linkedin: user.linkedin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPLOAD PROFILE PHOTO
app.post(
  '/api/profile/photo',
  authMiddleware,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select an image.',
        });
      }

      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'skill-career-platform/profile-photos',
            public_id: `user_${user._id}`,
            overwrite: true,
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Image upload failed.'));
            resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });

      user.profilePhoto = imageUrl;
      await user.save();

      res.json({
        message: 'Profile photo updated successfully.',
        profilePhoto: user.profilePhoto,
      });
    } catch (error) {
      console.error('Profile photo upload failed:', error);
      res.status(500).json({
        message: 'Could not upload profile photo.',
      });
    }
  }
);

// CREATE SKILL
app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const { name, category, level } = req.body;

    if (!name || !category || !level) {
      return res.status(400).json({
        message: 'Name, category and level are required',
      });
    }

    const skill = await Skill.create({
      user: req.userId,
      name,
      category,
      level,
    });

    res.status(201).json({
      message: 'Skill created successfully',
      skill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SKILLS
app.get('/api/skills', authMiddleware, async (req, res) => {
  try {
    const skills = await Skill.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE SKILL
app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, level } = req.body;

    const skill = await Skill.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    skill.name = name;
    skill.category = category;
    skill.level = level;

    await skill.save();

    res.json({
      message: 'Skill updated successfully',
      skill,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE SKILL
app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE PROGRESS
app.post('/api/progress', authMiddleware, async (req, res) => {
  try {
    const { skillId, progress } = req.body;

    if (!skillId || progress === undefined) {
      return res.status(400).json({
        message: 'Skill and progress are required',
      });
    }

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100',
      });
    }

    const skill = await Skill.findOne({
      _id: skillId,
      user: req.userId,
    });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const existingProgress = await Progress.findOne({
      user: req.userId,
      skill: skillId,
    });

    if (existingProgress) {
      return res.status(400).json({
        message: 'Progress already exists for this skill',
      });
    }

    const newProgress = await Progress.create({
      user: req.userId,
      skill: skillId,
      progress,
    });

    await newProgress.populate('skill', 'name category level');

    res.status(201).json(newProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET PROGRESS
app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.userId,
    })
      .populate('skill', 'name category level')
      .sort({ createdAt: -1 });

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROGRESS
app.put('/api/progress/:id', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100',
      });
    }

    const existingProgress = await Progress.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!existingProgress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    existingProgress.progress = progress;
    await existingProgress.save();

    res.json(existingProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE PROGRESS
app.delete('/api/progress/:id', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET CAREER PATHS
app.get('/api/career-paths', authMiddleware, async (req, res) => {
  try {
    const careerPaths = await CareerPath.find();
    res.json(careerPaths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GENERATE CAREER RECOMMENDATIONS
app.post(
  '/api/career-paths/recommendations',
  authMiddleware,
  async (req, res) => {
    let failureStage = 'loading recommendation data';

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          message: 'Gemini API key is not configured.',
        });
      }

      const user = await User.findById(req.userId).select(
        'degree careerGoal'
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const skills = await Skill.find({
        user: req.userId,
      }).select('name category level');

      if (!user.degree) {
        return res.status(400).json({
          message: 'Please add your degree to your profile first.',
        });
      }

      if (skills.length === 0) {
        return res.status(400).json({
          message: 'Please add some skills before requesting recommendations.',
        });
      }

      const prompt = `
You are a career guidance assistant.

Recommend 3 to 5 realistic career paths for this student.

Student degree: ${user.degree}
Career goal: ${user.careerGoal || 'Not specified'}
Skills: ${JSON.stringify(
        skills.map(({ name, category, level }) => ({
          name,
          category,
          level,
        }))
      )}

Requirements:
- Consider both the degree and the student's actual skills.
- Include different suitable career options where appropriate.
- Do not claim the student is already qualified for a job merely
  because they have a few related skills.
- Explain why each career is relevant.
- Identify matching skills and skills they should develop next.
- Return exactly 3 to 5 options.
`;

      failureStage = 'calling Gemini';
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                description: { type: 'STRING' },
                reasons: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                matchingSkills: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
                skillsToLearn: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                },
              },
              required: [
                'title',
                'description',
                'reasons',
                'matchingSkills',
                'skillsToLearn',
              ],
            },
          },
        },
      });

      failureStage = 'parsing Gemini response';
      const responseText = response.text;

      if (typeof responseText !== 'string' || !responseText.trim()) {
        throw new Error('Gemini returned an empty response.');
      }

      const recommendations = JSON.parse(responseText);

      failureStage = 'validating Gemini response';
      if (
        !Array.isArray(recommendations) ||
        recommendations.length < 3 ||
        recommendations.length > 5
      ) {
        throw new Error('Invalid recommendation response from Gemini.');
      }

      res.json({ recommendations });
    } catch (error) {
      console.error('Career recommendations failed:', {
        stage: failureStage,
        ...getSafeErrorDetails(error),
      });
      res.status(502).json({
        message: 'Could not generate career recommendations. Please try again.',
      });
    }
  }
);

// SAVE SELECTED CAREER
app.put('/api/career-paths/selected', authMiddleware, async (req, res) => {
  try {
    const { title, description, skills } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !Array.isArray(skills) ||
      !skills.every((skill) => typeof skill === 'string')
    ) {
      return res.status(400).json({ message: 'Invalid career details.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        selectedCareer: {
          title: title.trim(),
          description,
          skills,
        },
      },
      { new: true, runValidators: true }
    ).select('selectedCareer');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ selectedCareer: user.selectedCareer });
  } catch (error) {
    console.error('Failed to save selected career:', error.message);
    res.status(500).json({ message: 'Could not save selected career.' });
  }
});

// GET SELECTED CAREER
app.get('/api/career-paths/selected', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('selectedCareer');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ selectedCareer: user.selectedCareer });
  } catch (error) {
    console.error('Failed to load selected career:', error.message);
    res.status(500).json({ message: 'Could not load selected career.' });
  }
});

// NEW: GENERATE ROADMAP LEARNING RESOURCES
app.post('/api/roadmap/resources', authMiddleware, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: 'Gemini API key is not configured.',
      });
    }

    const { careerTitle, careerDescription = '', skill } = req.body;

    if (
      typeof careerTitle !== 'string' ||
      !careerTitle.trim() ||
      typeof skill !== 'string' ||
      !skill.trim()
    ) {
      return res.status(400).json({
        message: 'Career title and skill are required.',
      });
    }

    const prompt = `
You are a practical technical learning advisor.

Create a learning plan for the following roadmap step.

Target career: ${careerTitle.trim()}
Career description: ${String(careerDescription).slice(0, 1000)}
Skill to learn: ${skill.trim()}

Return useful, beginner-friendly learning resources suitable for a university student.

Requirements:
- Recommend 2 to 4 relevant online courses or learning resources.
- Recommend 1 to 3 relevant reference books where suitable.
- Prefer reputable providers, official documentation, and well-known publishers.
- Include the title, provider or publisher, URL, and a short description for each resource.
- Only provide URLs you believe are real and relevant. If you are unsure of a URL, use an empty string instead of inventing one.
- Estimate a realistic amount of learning time.
- Give one practical task the student can complete to practise the skill.
- Keep the recommendations specific to the skill and target career.
`;

    const resourceItemSchema = {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        provider: { type: 'STRING' },
        url: { type: 'STRING' },
        description: { type: 'STRING' },
      },
      required: ['title', 'provider', 'url', 'description'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            courses: {
              type: 'ARRAY',
              items: resourceItemSchema,
            },
            books: {
              type: 'ARRAY',
              items: resourceItemSchema,
            },
            duration: { type: 'STRING' },
            practicalTask: { type: 'STRING' },
          },
          required: ['courses', 'books', 'duration', 'practicalTask'],
        },
      },
    });

    const resources = JSON.parse(response.text || '{}');

    if (
      !Array.isArray(resources.courses) ||
      !Array.isArray(resources.books) ||
      typeof resources.duration !== 'string' ||
      typeof resources.practicalTask !== 'string'
    ) {
      throw new Error('Invalid learning resources response from Gemini.');
    }

    res.json({ resources });
  } catch (error) {
    console.error('Roadmap resource generation failed:', error.message);

    res.status(502).json({
      message: 'Could not generate learning resources. Please try again.',
    });
  }
});

// GET PROJECTS
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE PROJECT
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      github,
      liveDemo,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Project title is required',
      });
    }

    const project = await Project.create({
      user: req.userId,
      title,
      description,
      technologies,
      github,
      liveDemo,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROJECT
app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;
    const allowedFields = [
      'title',
      'description',
      'technologies',
      'github',
      'liveDemo',
      'imageUrl',
    ];

    if (!/^[a-f\d]{24}$/i.test(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    if (
      !updates ||
      typeof updates !== 'object' ||
      Array.isArray(updates) ||
      Object.keys(updates).length === 0 ||
      Object.keys(updates).some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({ message: 'Invalid project data' });
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, 'title') &&
      (typeof updates.title !== 'string' || !updates.title.trim())
    ) {
      return res.status(400).json({
        message: 'Project title must be a non-empty string',
      });
    }

    for (const field of ['description', 'github', 'liveDemo', 'imageUrl']) {
      if (
        Object.prototype.hasOwnProperty.call(updates, field) &&
        typeof updates[field] !== 'string'
      ) {
        return res.status(400).json({ message: `Invalid ${field}` });
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, 'technologies') &&
      (!Array.isArray(updates.technologies) ||
        updates.technologies.some(
          (technology) => typeof technology !== 'string'
        ))
    ) {
      return res.status(400).json({ message: 'Invalid technologies' });
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        project[field] = updates[field];
      }
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPLOAD PROJECT IMAGE
app.post(
  '/api/projects/:id/image',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'Please select an image.',
        });
      }

      const project = await Project.findOne({
        _id: req.params.id,
        user: req.userId,
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'skill-career-platform/project-images',
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Image upload failed.'));
            resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });

      project.imageUrl = imageUrl;
      await project.save();

      res.json({
        message: 'Project image uploaded successfully.',
        imageUrl: project.imageUrl,
        project,
      });
    } catch (error) {
      console.error('Project image upload failed:', error);
      res.status(500).json({
        message: 'Could not upload project image.',
      });
    }
  }
);

// DELETE PROJECT
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
