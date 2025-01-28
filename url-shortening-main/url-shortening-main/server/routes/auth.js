const express = require('express');
const bcrypt = require('bcryptjs');  // Use bcrypt for hashing passwords
const User = require('../models/User');  // Your User model
const router = express.Router();

// POST - Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// POST - Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Compare provided password with the hashed password in the DB
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Set session data after successful login
      sessionStorage.setItem('userId', req.user._id);
      res.status(200).json({ message: 'Login successful' });
    } catch (err) {
      res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  });
  

// Route to check if user is logged in
router.get('/check-session', (req, res) => {
    // if (req.session.userId) {
    //     res.status(200).json({ loggedIn: true, user: { email: req.session.email } });
    // } else {
    //     res.status(200).json({ loggedIn: false });
    // }
    console.log(req.session.id);
    res.json({session:req.session})
});

module.exports = router;
