// Bright Star International School Portal - Main Server
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/admissions', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admissions.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/teacher-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'teacher-dashboard.html'));
});

app.get('/results', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'results.html'));
});

app.get('/fees', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'fees.html'));
});

// Try to connect to MongoDB and load API routes
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
    const mongoose = require('mongoose');
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            loadApiRoutes(app);
        })
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
            console.log('Running without database - API routes disabled');
        });
} else {
    console.log('No MONGODB_URI set - Running without database');
}

function loadApiRoutes(app) {
    const authRoutes = require('./src/routes/auth');
    const studentRoutes = require('./src/routes/students');
    const teacherRoutes = require('./src/routes/teachers');
    const adminRoutes = require('./src/routes/admin');
    const resultRoutes = require('./src/routes/results');
    const feeRoutes = require('./src/routes/fees');
    const announcementRoutes = require('./src/routes/announcements');
    const timetableRoutes = require('./src/routes/timetables');
    const assignmentRoutes = require('./src/routes/assignments');
    const attendanceRoutes = require('./src/routes/attendance');

    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/teachers', teacherRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/results', resultRoutes);
    app.use('/api/fees', feeRoutes);
    app.use('/api/announcements', announcementRoutes);
    app.use('/api/timetables', timetableRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/attendance', attendanceRoutes);
    
    console.log('API routes loaded');
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
