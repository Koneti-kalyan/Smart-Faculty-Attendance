const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database/db');
const { verifyGeofenceLocation } = require('../services/geofence');

// GET /api/geofence/active
router.get('/active', async (req, res) => {
    try {
        const geofence = await dbQuery.get(`SELECT * FROM geofences WHERE is_active = 1 LIMIT 1`);
        
        const data = geofence || {
            campus_name: 'SVPCET Main Campus, Puttur',
            center_lat: 13.433369,
            center_lon: 79.509354,
            radius_meters: 50
        };

        res.json({
            success: true,
            geofence: data
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch geofence configuration.' });
    }
});

// POST /api/geofence/verify
router.post('/verify', async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required.' });
        }

        const geofence = await dbQuery.get(`SELECT * FROM geofences WHERE is_active = 1 LIMIT 1`);
        const campusLat = geofence ? geofence.center_lat : 13.433369;
        const campusLon = geofence ? geofence.center_lon : 79.509354;
        const radius = geofence ? geofence.radius_meters : 50;

        const result = verifyGeofenceLocation(lat, lon, campusLat, campusLon, radius);

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error verifying location.' });
    }
});

module.exports = router;
