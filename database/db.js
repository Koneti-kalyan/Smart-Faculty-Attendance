const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'attendance.db');
const JSON_BACKUP_PATH = path.join(__dirname, 'attendance_data.json');

let sqlite3 = null;
try {
    sqlite3 = require('sqlite3').verbose();
} catch (e) {
    console.warn('Native sqlite3 module not available, fallback to file DB mode:', e.message);
}

let db = null;
let isNativeSqlite = false;

// Fallback JSON-based persistent storage store
let fallbackData = {
    users: [],
    attendance_logs: [],
    geofences: [
        {
            id: 1,
            campus_name: 'SVPCET Main Campus, Puttur',
            center_lat: 13.433369,
            center_lon: 79.509354,
            radius_meters: 50,
            is_active: 1
        }
    ]
};

function loadJsonBackup() {
    if (fs.existsSync(JSON_BACKUP_PATH)) {
        try {
            const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf8');
            fallbackData = JSON.parse(raw);
        } catch (e) {
            console.error('Failed reading JSON backup file:', e);
        }
    }
}

function saveJsonBackup() {
    try {
        fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(fallbackData, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed saving JSON backup file:', e);
    }
}

function initDatabase() {
    return new Promise((resolve) => {
        if (sqlite3) {
            db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Failed to open SQLite database, using JSON fallback:', err);
                    loadJsonBackup();
                    resolve(false);
                } else {
                    isNativeSqlite = true;
                    console.log('Connected to SQLite database at:', DB_PATH);
                    createTables().then(() => resolve(true));
                }
            });
        } else {
            loadJsonBackup();
            resolve(false);
        }
    });
}

function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users Table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    department TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    face_descriptor TEXT,
                    profile_image TEXT,
                    role TEXT DEFAULT 'faculty',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Attendance Logs Table
            db.run(`
                CREATE TABLE IF NOT EXISTS attendance_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    status TEXT NOT NULL,
                    check_in_time TEXT,
                    check_out_time TEXT,
                    check_in_lat REAL,
                    check_in_lon REAL,
                    check_in_geofence_verified INTEGER DEFAULT 0,
                    check_in_face_confidence REAL,
                    check_out_lat REAL,
                    check_out_lon REAL,
                    check_out_geofence_verified INTEGER DEFAULT 0,
                    check_out_face_confidence REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            // Geofence Config Table
            db.run(`
                CREATE TABLE IF NOT EXISTS geofences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    campus_name TEXT NOT NULL,
                    center_lat REAL NOT NULL,
                    center_lon REAL NOT NULL,
                    radius_meters REAL NOT NULL,
                    is_active INTEGER DEFAULT 1
                )
            `);

            // Seed default SVPCET Campus Geofence if empty
            db.get(`SELECT COUNT(*) as count FROM geofences`, (err, row) => {
                if (!err && row && row.count === 0) {
                    db.run(`
                        INSERT INTO geofences (campus_name, center_lat, center_lon, radius_meters, is_active)
                        VALUES ('SVPCET Main Campus, Puttur', 13.433369, 79.509354, 50, 1)
                    `);
                }
            });

            // Seed default Faculty Member if empty
            db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
                if (!err && row && row.count === 0) {
                    const bcrypt = require('bcryptjs');
                    const defaultPassHash = bcrypt.hashSync('password123', 10);
                    db.run(`
                        INSERT INTO users (faculty_id, name, email, department, password_hash, role)
                        VALUES ('SVPCET-CS-1049', 'Dr. Sarah Jenkins', 'sarah.jenkins@svpcet.edu.in', 'CS Department', ?, 'faculty')
                    `, [defaultPassHash]);
                }
                resolve();
            });
        });
    });
}

// Database Wrapper Helpers
const dbQuery = {
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (isNativeSqlite && db) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            } else {
                // Basic JSON fallback matching
                resolve(fallbackData.attendance_logs);
            }
        });
    },

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (isNativeSqlite && db) {
                db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            } else {
                resolve(null);
            }
        });
    },

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (isNativeSqlite && db) {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            } else {
                saveJsonBackup();
                resolve({ id: Date.now(), changes: 1 });
            }
        });
    }
};

module.exports = {
    initDatabase,
    dbQuery,
    isNativeSqlite: () => isNativeSqlite,
    getFallbackData: () => fallbackData,
    saveJsonBackup
};
