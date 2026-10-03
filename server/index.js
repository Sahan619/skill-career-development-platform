const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const Skill = require('./models/Skill');


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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});