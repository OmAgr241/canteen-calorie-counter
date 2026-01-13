const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password and create user
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = db.prepare(`
      INSERT INTO users (email, password, name)
      VALUES (?, ?, ?)
    `).run(email, hashedPassword, name);

        // Generate token
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                dailyCalorieGoal: user.dailyCalorieGoal,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                height: user.height,
                weight: user.weight,
                age: user.age,
                gender: user.gender,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            height: user.height,
            weight: user.weight,
            age: user.age,
            gender: user.gender,
            activityLevel: user.activityLevel,
            dailyCalorieGoal: user.dailyCalorieGoal,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update profile
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { name, height, weight, age, gender, activityLevel, dailyCalorieGoal } = req.body;

        db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          height = COALESCE(?, height),
          weight = COALESCE(?, weight),
          age = COALESCE(?, age),
          gender = COALESCE(?, gender),
          activityLevel = COALESCE(?, activityLevel),
          dailyCalorieGoal = COALESCE(?, dailyCalorieGoal)
      WHERE id = ?
    `).run(name, height, weight, age, gender, activityLevel, dailyCalorieGoal, req.user.id);

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                height: user.height,
                weight: user.weight,
                age: user.age,
                gender: user.gender,
                activityLevel: user.activityLevel,
                dailyCalorieGoal: user.dailyCalorieGoal,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
