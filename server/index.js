const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const Skill = require('./models/Skill');
const Progress = require('./models/Progress');
const CareerPath = require('./models/CareerPath');


const connectDB = require('./config/db');
const User = require('./models/User');


const app = express();
app.use(cors());
app.use(express.json());
connectDB();

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Skill and Career Development API is running');
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    // Send successful response
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

    res.status(500).json({
      message: 'Server error',
    });
  }
});
// This id=s for Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
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

    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

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
      return res.status(404).json({
        message: 'User not found',
      });
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

    res.status(500).json({
      message: 'Server error',
    });
  }
});

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

    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.get('/api/skills', authMiddleware, async (req, res) => {
  try {
    const skills = await Skill.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json(skills);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, level } = req.body;

    const skill = await Skill.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found',
      });
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

    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found',
      });
    }

    res.json({
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
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
      return res.status(404).json({
        message: 'Skill not found',
      });
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

    res.status(201).json(newProgress);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
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

    res.status(500).json({
      message: 'Server error',
    });
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
      return res.status(404).json({
        message: 'Progress not found',
      });
    }

    existingProgress.progress = progress;

    await existingProgress.save();

    res.json(existingProgress);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
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
      return res.status(404).json({
        message: 'Progress not found',
      });
    }

    res.json({
      message: 'Progress deleted successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET CAREER PATHS
app.get('/api/career-paths', authMiddleware, async (req, res) => {
  try {
    const careerPaths = await CareerPath.find().sort({ createdAt: -1 });

    res.json(careerPaths);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// CREATE CAREER PATH
// ADD SAMPLE CAREER PATHS
app.post('/api/career-paths/seed', authMiddleware, async (req, res) => {
  try {
    const existingPaths = await CareerPath.countDocuments();

    if (existingPaths > 0) {
      return res.json({
        message: 'Career paths already exist',
      });
    }

    await CareerPath.insertMany([
      {
        title: 'AI Engineer',
        description: 'Build and deploy artificial intelligence and machine learning systems.',
        skills: [
          'Python',
          'NumPy',
          'Pandas',
          'Machine Learning',
          'Deep Learning',
          'NLP',
          'LLMs',
        ],
      },
      {
        title: 'Software Engineer',
        description: 'Design, develop, test, and maintain software applications.',
        skills: [
          'Programming',
          'Data Structures',
          'Algorithms',
          'Git',
          'Databases',
          'APIs',
        ],
      },
      {
        title: 'Data Scientist',
        description: 'Analyze data and build models to support data-driven decisions.',
        skills: [
          'Python',
          'Statistics',
          'NumPy',
          'Pandas',
          'Machine Learning',
          'Data Visualization',
        ],
      },
    ]);

    res.status(201).json({
      message: 'Career paths created successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});