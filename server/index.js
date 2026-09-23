const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');


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

app.post('/api/auth/login',(req,res) => {
    
   const{email , password} =req.body;
   
   console.log('Email :',email);
   console.log('Password :', password);

   res.json({
        message: 'Login request recieved',
        email: email,

   });
      

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




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});