const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbQuery } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'svpcet_smart_faculty_secret_key_2026';

// Middleware to verify JWT Token (optional or user extraction)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) req.user = null;
        else req.user = user;
        next();
    });
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { faculty_id, password } = req.body;

        if (!faculty_id || !password) {
            return res.status(400).json({ success: false, message: 'Faculty ID and Password are required.' });
        }

        const user = await dbQuery.get(
            `SELECT * FROM users WHERE faculty_id = ? OR email = ?`,
            [faculty_id, faculty_id]
        );

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid Faculty ID/Email or Password.' });
        }

        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid Faculty ID/Email or Password.' });
        }

        const token = jwt.sign(
            { id: user.id, faculty_id: user.faculty_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                faculty_id: user.faculty_id,
                name: user.name,
                email: user.email,
                department: user.department,
                role: user.role,
                face_registered: !!user.face_descriptor,
                profile_image: user.profile_image
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { faculty_id, name, email, department, password, face_descriptor } = req.body;

        if (!faculty_id || !name || !password) {
            return res.status(400).json({ success: false, message: 'Faculty ID, Name, and Password are required.' });
        }

        // Check if existing
        const existing = await dbQuery.get(
            `SELECT id FROM users WHERE faculty_id = ? OR email = ?`,
            [faculty_id, email || faculty_id]
        );

        if (existing) {
            return res.status(400).json({ success: false, message: 'Faculty ID or Email is already registered.' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const userEmail = email || `${faculty_id.toLowerCase()}@svpcet.edu.in`;
        const userDept = department || 'CS Department';
        const descriptorStr = face_descriptor ? JSON.stringify(face_descriptor) : null;

        const result = await dbQuery.run(
            `INSERT INTO users (faculty_id, name, email, department, password_hash, face_descriptor)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [faculty_id, name, userEmail, userDept, password_hash, descriptorStr]
        );

        const token = jwt.sign(
            { id: result.id, faculty_id, role: 'faculty' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Faculty registration complete.',
            token,
            user: {
                id: result.id,
                faculty_id,
                name,
                email: userEmail,
                department: userDept,
                role: 'faculty',
                face_registered: !!descriptorStr
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const user = await dbQuery.get(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Faculty not found.' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                faculty_id: user.faculty_id,
                name: user.name,
                email: user.email,
                department: user.department,
                role: user.role,
                face_registered: !!user.face_descriptor,
                profile_image: user.profile_image
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching faculty profile.' });
    }
});

// POST /api/auth/register-face
router.post('/register-face', async (req, res) => {
    try {
        const { faculty_id, face_descriptor, profile_image } = req.body;

        if (!faculty_id) {
            return res.status(400).json({ success: false, message: 'Faculty ID required.' });
        }

        const descriptorStr = face_descriptor ? JSON.stringify(face_descriptor) : null;

        await dbQuery.run(
            `UPDATE users SET face_descriptor = ?, profile_image = COALESCE(?, profile_image) WHERE faculty_id = ?`,
            [descriptorStr, profile_image, faculty_id]
        );

        res.json({
            success: true,
            message: 'Facial biometric profile saved successfully.'
        });
    } catch (err) {
        console.error('Save face descriptor error:', err);
        res.status(500).json({ success: false, message: 'Failed to update face biometric template.' });
    }
});

module.exports = router;
