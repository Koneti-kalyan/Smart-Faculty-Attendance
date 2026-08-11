const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database/db');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const geofenceRoutes = require('./routes/geofence');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/geofence', geofenceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'SVPCET Smart Faculty Attendance System',
        timestamp: new Date().toISOString()
    });
});

// Static Files Serving
app.use(express.static(__dirname));

// Fallback to index.html for SPA / client routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Express Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Initialize Database and Start Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`  🎓 SVPCET Smart Faculty Attendance Full-Stack Server`);
        console.log(`  🚀 Backend API:  http://localhost:${PORT}/api/health`);
        console.log(`  📱 Web Portal:   http://localhost:${PORT}`);
        console.log(`====================================================`);
    });
});
