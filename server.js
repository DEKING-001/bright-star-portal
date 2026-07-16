// Bright Star International School Portal - Main Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const store = require('./src/dataStore');
const { setBlacklist } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bright_star_secret';

// ---------- MongoDB connection (optional; falls back to in-memory) ----------
let cachedConnection = null;
let dbReady = false;

async function connectDB() {
    if (dbReady && mongoose.connection.readyState === 1) return cachedConnection;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.log('No MONGODB_URI set — using in-memory data store (data will not persist).');
        return;
    }
    try {
        mongoose.set('strictQuery', true);
        cachedConnection = mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        await cachedConnection;
        store.setDbConnected(true);
        dbReady = true;
        console.log('MongoDB connected.');
        store.seedIfEmpty().catch(err => {
            console.error('Seed error (non-fatal):', err.message);
        });
    } catch (err) {
        cachedConnection = null;
        dbReady = false;
        console.error('MongoDB connection failed, falling back to in-memory store:', err.message);
    }
    return cachedConnection;
}

// Reset dbConnected when MongoDB disconnects
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — falling back to in-memory store');
    dbReady = false;
    store.setDbConnected(false);
});
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    dbReady = false;
    store.setDbConnected(false);
});

// Start server immediately, connect to DB in background
async function start() {
    await connectDB().catch(() => {});
    if (require.main === module) {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}
start();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js'), { maxAge: 0, etag: false }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/vendor/js', express.static(path.join(__dirname, 'node_modules', 'jspdf', 'dist'), { maxAge: 0, etag: false }));
app.use('/vendor/js', express.static(path.join(__dirname, 'node_modules', 'html2canvas', 'dist'), { maxAge: 0, etag: false }));

// Demo Users Database
const demoUsers = {
    // Admin — works for both branches (branch ignored for admin login)
    'admin@brightstar.com': { id: '1', email: 'admin@brightstar.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin', branch: 'secondary' },
    // Secondary branch
    'TCH/001': { id: '2', email: 'john.owens@brightstar.com', password: 'password123', firstName: 'John', lastName: 'Owens', role: 'teacher', staffId: 'TCH/001', branch: 'secondary' },
    'BSS/2026/001': { id: '3', email: 'chukwuemeka@student.com', password: 'password123', firstName: 'Chukwuemeka', lastName: 'Okonkwo', role: 'student', admissionNumber: 'BSS/2026/001', class: 'SS1', session: '2025/2026', term: 'Second Term', branch: 'secondary' },
    'BSS/2026/002': { id: '4', email: 'amina@student.com', password: 'password123', firstName: 'Amina', lastName: 'Ibrahim', role: 'student', admissionNumber: 'BSS/2026/002', class: 'SS1', session: '2025/2026', term: 'Second Term', branch: 'secondary' },
    // Nursery branch
    'TCH/N/001': { id: '5', email: 'ngozi.okafor@brightstar.com', password: 'password123', firstName: 'Ngozi', lastName: 'Okafor', role: 'teacher', staffId: 'TCH/N/001', branch: 'nursery' },
    'BNP/2026/001': { id: '6', email: 'chinedu@student.com', password: 'password123', firstName: 'Chinedu', lastName: 'Eze', role: 'student', admissionNumber: 'BNP/2026/001', class: 'Nursery 3', session: '2025/2026', term: 'Second Term', branch: 'nursery' },
    'BNP/2026/002': { id: '7', email: 'zainab@student.com', password: 'password123', firstName: 'Zainab', lastName: 'Bello', role: 'student', admissionNumber: 'BNP/2026/002', class: 'Primary 1', session: '2025/2026', term: 'Second Term', branch: 'nursery' }
};

// Demo Results
const demoResults = {
    'BSS/2026/001': [
        { subject: 'Mathematics', ca1: 18, ca2: 17, exam: 52, totalScore: 87, grade: 'A' },
        { subject: 'English Language', ca1: 16, ca2: 15, exam: 45, totalScore: 76, grade: 'A' },
        { subject: 'Physics', ca1: 15, ca2: 14, exam: 42, totalScore: 71, grade: 'A' },
        { subject: 'Chemistry', ca1: 14, ca2: 13, exam: 38, totalScore: 65, grade: 'B' },
        { subject: 'Biology', ca1: 16, ca2: 15, exam: 40, totalScore: 71, grade: 'A' }
    ],
    'BSS/2026/002': [
        { subject: 'Mathematics', ca1: 17, ca2: 16, exam: 48, totalScore: 81, grade: 'A' },
        { subject: 'English Language', ca1: 18, ca2: 17, exam: 50, totalScore: 85, grade: 'A' },
        { subject: 'Physics', ca1: 14, ca2: 13, exam: 36, totalScore: 63, grade: 'B' },
        { subject: 'Chemistry', ca1: 15, ca2: 14, exam: 40, totalScore: 69, grade: 'B' },
        { subject: 'Biology', ca1: 17, ca2: 16, exam: 44, totalScore: 77, grade: 'A' }
    ]
};

// Demo Announcements
const demoAnnouncements = [
    { _id: '1', title: 'Second Term Examinations', content: 'Second term examinations will commence from July 20th to August 1st, 2026.', category: 'academic', createdAt: new Date('2026-07-05') },
    { _id: '2', title: 'Inter-House Sports Competition', content: 'Annual inter-house sports competition will hold on July 15th, 2026.', category: 'sports', createdAt: new Date('2026-07-02') },
    { _id: '3', title: 'Graduation Ceremony 2026', content: 'The graduation ceremony for the class of 2026 will hold on August 5th, 2026.', category: 'events', createdAt: new Date('2026-06-28') }
];

// Demo Students
const demoStudents = [
    { _id: '1', admissionNumber: 'BSS/2026/001', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Okonkwo', parentPhone: '+234 801 234 5678', user: { firstName: 'Chukwuemeka', lastName: 'Okonkwo', email: 'chukwuemeka@student.com' } },
    { _id: '2', admissionNumber: 'BSS/2026/002', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Mr. Ibrahim', parentPhone: '+234 802 345 6789', user: { firstName: 'Amina', lastName: 'Ibrahim', email: 'amina@student.com' } },
    { _id: '3', admissionNumber: 'BSS/2026/003', class: 'JSS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mrs. Adeyemi', parentPhone: '+234 803 456 7890', user: { firstName: 'David', lastName: 'Adeyemi', email: 'david@student.com' } },
    { _id: '4', admissionNumber: 'BSS/2026/004', class: 'SS2', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Alhaji Mohammed', parentPhone: '+234 804 567 8901', user: { firstName: 'Fatima', lastName: 'Mohammed', email: 'fatima@student.com' } },
    { _id: '5', admissionNumber: 'BSS/2026/005', class: 'JSS2', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Dr. Okoro', parentPhone: '+234 805 678 9012', user: { firstName: 'Emmanuel', lastName: 'Okoro', email: 'emmanuel@student.com' } }
];

// Demo Teachers
const demoTeachers = [
    { _id: '1', staffId: 'TCH/001', department: 'Science', subjects: ['Mathematics', 'Further Mathematics'], qualification: 'M.Sc Mathematics', experience: 10, status: 'active', user: { firstName: 'John', lastName: 'Owens', email: 'john.owens@brightstar.com' } },
    { _id: '2', staffId: 'TCH/002', department: 'Languages', subjects: ['English Language', 'Literature'], qualification: 'M.A English', experience: 8, status: 'active', user: { firstName: 'Sarah', lastName: 'Adesanya', email: 'sarah.adesanya@brightstar.com' } },
    { _id: '3', staffId: 'TCH/003', department: 'Science', subjects: ['Physics', 'Chemistry'], qualification: 'M.Sc Physics', experience: 12, status: 'active', user: { firstName: 'Michael', lastName: 'Ugbo', email: 'michael.ugbo@brightstar.com' } }
];

// Demo Fees
const demoFees = [
    { _id: '1', admissionNumber: 'BSS/2026/001', session: '2025/2026', term: 'Second Term', totalFee: 320000, amountPaid: 150000, balance: 170000, status: 'partial', paymentHistory: [{ amount: 150000, date: new Date('2025-09-15'), method: 'bank_transfer', reference: 'TRF/2025/001' }] },
    { _id: '2', admissionNumber: 'BSS/2026/002', session: '2025/2026', term: 'Second Term', totalFee: 250000, amountPaid: 250000, balance: 0, status: 'paid', paymentHistory: [{ amount: 250000, date: new Date('2025-09-10'), method: 'bank_transfer', reference: 'TRF/2025/002' }] }
];

// Demo Attendance
const demoAttendance = [
    { _id: '1', admissionNumber: 'BSS/2026/001', date: new Date('2026-07-07'), status: 'present' },
    { _id: '2', admissionNumber: 'BSS/2026/001', date: new Date('2026-07-04'), status: 'present' },
    { _id: '3', admissionNumber: 'BSS/2026/001', date: new Date('2026-07-03'), status: 'late', remark: 'Arrived 15 minutes late' },
    { _id: '4', admissionNumber: 'BSS/2026/001', date: new Date('2026-07-02'), status: 'present' },
    { _id: '5', admissionNumber: 'BSS/2026/001', date: new Date('2026-07-01'), status: 'absent' }
];

// Generate JWT Token — embeds the user's role so middleware can enforce
// namespace isolation server-side (a teacher token cannot access admin routes, etc.)
function generateToken(id, role) {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
}

// ---------- Token Blacklist (in-memory) ----------
// Stores blacklisted JWTs (logged-out tokens) so they can no longer be used.
// In production, use Redis with a TTL matching the token expiry.
const tokenBlacklist = new Set();
setBlacklist(tokenBlacklist);

function isTokenBlacklisted(token) {
    return tokenBlacklist.has(token);
}

function blacklistToken(token) {
    tokenBlacklist.add(token);
}

// Reusable middleware: verify JWT and enforce allowed roles.
// Also checks the blacklist so logged-out tokens are rejected.
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ success: false, message: 'Token has been invalidated. Please log in again.' });
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: `Role '${decoded.role}' is not authorized for this route` });
            }
            req.user = decoded;
            next();
        } catch {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
    };
}

// ============ API ROUTES ============

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
    const { identifier, password, role, branch } = req.body;
    
    if (!branch || !['nursery', 'secondary'].includes(branch)) {
        return res.status(400).json({ success: false, message: 'Please select a valid branch' });
    }
    
    // Try store first (MongoDB), fall back to demoUsers
    let user = await store.findUserByIdentifier(identifier);
    if (!user) user = demoUsers[identifier];
    
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (role && user.role !== role) {
        return res.status(401).json({ success: false, message: 'Invalid role for this account' });
    }
    
    // Branch access control: verify user belongs to the selected branch (skip for admin)
    if (user.role !== 'admin' && user.branch && user.branch !== branch) {
        return res.status(403).json({ success: false, message: 'Unauthorized: This account does not belong to the selected branch' });
    }
    
    const token = generateToken(user.id, user.role);
    
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            branch: user.branch,
            admissionNumber: user.admissionNumber,
            staffId: user.staffId
        }
    });
});

// Auth - Get current user
app.get('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ success: false, message: 'Token has been invalidated. Please log in again.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Try store first (MongoDB), fall back to demoUsers
        let user = await store.findUserById(decoded.id);
        if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
});

// Auth - Verify token validity (used by client on page load).
// Returns the token's embedded role so the client can enforce portal guards.
app.get('/api/auth/verify', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, valid: false, message: 'No token provided' });

    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ success: false, valid: false, message: 'Token has been invalidated' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Try store first (MongoDB), fall back to demoUsers
        let user = await store.findUserById(decoded.id);
        if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, valid: false, message: 'User not found' });
        }
        res.json({ success: true, valid: true, role: decoded.role, user: { id: user.id, role: user.role } });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, valid: false, message: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, valid: false, message: 'Invalid token' });
        }
        console.error('Verify token error:', err);
        return res.status(500).json({ success: false, valid: false, message: 'Verification failed' });
    }
});

// Auth - Logout (invalidates the token server-side)
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }
    try {
        jwt.verify(token, JWT_SECRET);
        blacklistToken(token);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

// Auth - Change Password
app.put('/api/auth/change-password', (req, res) => {
    res.json({ success: true, message: 'Password updated successfully' });
});

// Students - Get profile
app.get('/api/students/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ success: false, message: 'Token has been invalidated. Please log in again.' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        let user = await store.findUserById(decoded.id);
        if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const student = await store.getStudentByAdmission(user.admissionNumber);
        res.json({ success: true, student: student || { admissionNumber: user.admissionNumber, class: user.class, session: user.session, term: user.term } });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
});

// Students - Get all
app.get('/api/students/all', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const students = await store.getAllStudents(filter);
        res.json({ success: true, count: students.length, students });
    } catch (err) {
        console.error('Get all students error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
});

// Students - Create (admin only)
app.post('/api/students', requireRole('admin'), async (req, res) => {
    const { firstName, lastName, email, admissionNumber: inputAdmissionNo, class: studentClass, gender, password, session, term, branch } = req.body;
    
    if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }
    
    const studentBranch = branch || 'secondary';
    
    // Auto-generate admission number if not provided
    let admissionNumber = inputAdmissionNo;
    if (!admissionNumber) {
        const currentYear = new Date().getFullYear();
        const prefix = studentBranch === 'nursery' ? 'BNP' : 'BSS';
        const existingStudents = await store.getAllStudents({ branch: studentBranch });
        const yearStudents = existingStudents.filter(s => s.admissionNumber && s.admissionNumber.includes(`${prefix}/${currentYear}`));
        const nextNumber = yearStudents.length + 1;
        admissionNumber = `${prefix}/${currentYear}/${String(nextNumber).padStart(3, '0')}`;
    }
    
    const existingStudents = await store.getAllStudents({ branch: studentBranch });
    const exists = existingStudents.find(s => s.admissionNumber === admissionNumber);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Admission number already exists' });
    }
    
    const newStudent = await store.createStudent({
        admissionNumber,
        password: password || 'password123',
        branch: studentBranch,
        class: studentClass,
        gender,
        session,
        term,
        parentName: '',
        parentPhone: '',
        user: { firstName, lastName, email }
    });
    
    res.status(201).json({ success: true, message: 'Student added successfully', student: newStudent });
});

// Students - Update (admin only)
app.put('/api/students/:id', requireRole('admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, admissionNumber, class: studentClass, gender, parentName, parentPhone, password } = req.body;

        const student = await store.updateStudent(req.params.id, {
            firstName, lastName, email, admissionNumber,
            class: studentClass, gender, parentName, parentPhone
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, message: 'Student updated successfully', student });
    } catch (err) {
        console.error('Update student error:', err);
        res.status(500).json({ success: false, message: 'Failed to update student' });
    }
});

// Students - Delete (admin only)
app.delete('/api/students/:id', requireRole('admin'), async (req, res) => {
    try {
        const students = await store.getAllStudents();
        const student = students.find(s => String(s._id) === String(req.params.id));
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        await store.deleteStudent(req.params.id);

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Delete student error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
});

// Teachers - Get all
app.get('/api/teachers/all', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const teachers = await store.getAllTeachers(filter);
        res.json({ success: true, count: teachers.length, teachers });
    } catch (err) {
        console.error('Get all teachers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
    }
});

// Teachers - Create (admin only)
app.post('/api/teachers', requireRole('admin'), async (req, res) => {
    const { firstName, lastName, email, staffId, department, password, branch } = req.body;
    
    if (!firstName || !lastName || !staffId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const teacherBranch = branch || 'secondary';
    
    const existingTeachers = await store.getAllTeachers({ branch: teacherBranch });
    const exists = existingTeachers.find(t => t.staffId === staffId);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Staff ID already exists' });
    }
    
    const newTeacher = await store.createTeacher({
        staffId,
        password: password || 'password123',
        branch: teacherBranch,
        department,
        subjects: [],
        qualification: '',
        experience: 0,
        status: 'active',
        user: { firstName, lastName, email }
    });
    
    res.status(201).json({ success: true, message: 'Teacher added successfully', teacher: newTeacher });
});

// Teachers - Update (admin only)
app.put('/api/teachers/:id', requireRole('admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, staffId, department, qualification, password } = req.body;

        const teacher = await store.updateTeacher(req.params.id, {
            firstName, lastName, email, staffId, department, qualification
        });
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        res.json({ success: true, message: 'Teacher updated successfully', teacher });
    } catch (err) {
        console.error('Update teacher error:', err);
        res.status(500).json({ success: false, message: 'Failed to update teacher' });
    }
});

// Teachers - Delete (admin only)
app.delete('/api/teachers/:id', requireRole('admin'), async (req, res) => {
    try {
        const teachers = await store.getAllTeachers();
        const teacher = teachers.find(t => String(t._id) === String(req.params.id));
        if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

        await store.deleteTeacher(req.params.id);

        res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (err) {
        console.error('Delete teacher error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete teacher' });
    }
});

// Announcements - Create (admin only)
app.post('/api/announcements', requireRole('admin'), async (req, res) => {
    const { title, category, content, branch } = req.body;
    try {
        const announcement = await store.createAnnouncement({ title, category, content, branch: branch || 'secondary' });
        res.status(201).json({ success: true, announcement });
    } catch (err) {
        console.error('Create announcement error:', err);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
});

// Announcements - Delete (admin only)
app.delete('/api/announcements/:id', requireRole('admin'), async (req, res) => {
    try {
        const ok = await store.deleteAnnouncement(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
        console.error('Delete announcement error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete announcement' });
    }
});

// Results - Get student results
app.get('/api/results/student', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token && !isTokenBlacklisted(token)) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            let user = await store.findUserById(decoded.id);
            if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
            if (user) admissionNumber = user.admissionNumber;
        } catch (err) {}
    }
    
    // Try store first (MongoDB), fall back to demoResults
    let results = [];
    if (store.isDbConnected()) {
        const data = await store.getStudentResultSummary(admissionNumber, '2025/2026', 'Second Term');
        results = data.results || [];
    } else {
        results = demoResults[admissionNumber] || [];
    }
    let totalScore = 0;
    results.forEach(r => totalScore += r.totalScore);
    const average = results.length > 0 ? (totalScore / results.length).toFixed(2) : 0;
    
    res.json({
        success: true,
        results,
        summary: { totalScore, average: parseFloat(average), position: 5, totalSubjects: results.length }
    });
});

// Teacher uploads results (teacher only — Single Batch: upsert into an existing 'pending' record)
app.post('/api/results', requireRole('teacher'), async (req, res) => {
    const { class: cls, subject, session, term, students, status } = req.body;
    if (!cls || !subject || !Array.isArray(students)) {
        return res.status(400).json({ success: false, message: 'Class, subject and students are required' });
    }
    try {
        const result = await store.upsertResultUpload({ class: cls, subject, session, term, students, status });
        const statusCode = result.created ? 201 : 200;
        res.status(statusCode).json({ success: true, ...result });
    } catch (err) {
        console.error('Result upload error:', err);
        res.status(500).json({ success: false, message: 'Failed to save results' });
    }
});

// Admin: fetch only result records pending verification
app.get('/api/results/pending', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const results = await store.getPendingResultUploads(filter);
        res.json({ success: true, results });
    } catch (err) {
        console.error('Pending results error:', err);
        res.status(500).json({ success: false, message: 'Failed to load pending results' });
    }
});

// Admin: approve (verify) a result batch
app.post('/api/results/:id/approve', requireRole('admin'), async (req, res) => {
    try {
        const upload = await store.approveResultUpload(req.params.id);
        if (!upload) return res.status(404).json({ success: false, message: 'Result record not found' });
        res.json({ success: true, result: upload });
    } catch (err) {
        console.error('Approve result error:', err);
        res.status(500).json({ success: false, message: 'Failed to approve result' });
    }
});

// ═════════════════════════════════════════════════════════════════════════
// Result Processing & Ranking System Routes
// ═════════════════════════════════════════════════════════════════════════

// Teacher: upload results for a class/subject (upsert batch + individual records)
app.post('/api/v2/results', requireRole('teacher'), async (req, res) => {
    try {
        const { class: cls, subject, session, term, students, branch } = req.body;
        if (!cls || !subject || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: 'Class, subject and students array are required' });
        }

        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
        let user = await store.findUserById(decoded.id);
        if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
        const uploadedBy = user ? (user.staffId || user.email) : 'unknown';
        const uploadedByName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
        const resultBranch = branch || (user ? user.branch : 'secondary');

        const { batch, replaced } = await store.createResultBatch({
            class: cls, subject, session, term, students, uploadedBy, uploadedByName, branch: resultBranch
        });

        const message = replaced
            ? 'Existing results updated. Pending admin approval.'
            : 'Results saved. Pending admin approval.';

        res.status(replaced ? 200 : 201).json({ success: true, message, batch, replaced });
    } catch (err) {
        console.error('Create result batch error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A pending batch already exists for this class/subject/term/session.' });
        }
        res.status(500).json({ success: false, message: 'Failed to save results' });
    }
});

// Teacher: view their own uploaded batches
app.get('/api/v2/results/teacher', requireRole('teacher'), async (req, res) => {
    try {
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], JWT_SECRET);
        let user = await store.findUserById(decoded.id);
        if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
        const uploadedBy = user ? (user.staffId || user.email) : 'unknown';
        const filter = {};
        if (user && user.branch) filter.branch = user.branch;

        const batches = await store.getTeacherResultBatches(uploadedBy, filter);
        res.json({ success: true, batches });
    } catch (err) {
        console.error('Get teacher results error:', err);
        res.status(500).json({ success: false, message: 'Failed to load results' });
    }
});

// Admin: get all pending batches
app.get('/api/v2/results/pending', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const batches = await store.getPendingResultBatches(filter);
        res.json({ success: true, batches });
    } catch (err) {
        console.error('Get pending batches error:', err);
        res.status(500).json({ success: false, message: 'Failed to load pending results' });
    }
});

// Admin: get a batch with its student results (for preview before approval)
app.get('/api/v2/results/batch/:id', requireRole('admin'), async (req, res) => {
    try {
        const data = await store.getResultBatchWithStudents(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Get batch error:', err);
        res.status(500).json({ success: false, message: 'Failed to load batch' });
    }
});

// Admin: approve a batch → triggers ranking engine
app.post('/api/v2/results/batch/:id/approve', requireRole('admin'), async (req, res) => {
    try {
        const batch = await store.approveResultBatch(req.params.id);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.json({ success: true, message: 'Results approved and rankings computed.', batch });
    } catch (err) {
        console.error('Approve batch error:', err);
        res.status(500).json({ success: false, message: 'Failed to approve batch' });
    }
});

// Student: view own approved results with summary/ranking
app.get('/api/v2/results/student', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        let admissionNumber = 'BSS/2026/001';
        if (token && !isTokenBlacklisted(token)) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                let user = await store.findUserById(decoded.id);
                if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
                if (user) admissionNumber = user.admissionNumber;
            } catch (err) {}
        }

        const session = req.query.session || '2025/2026';
        const term = req.query.term || 'Second Term';

        const data = await store.getStudentResultSummary(admissionNumber, session, term);
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Get student results error:', err);
        res.status(500).json({ success: false, message: 'Failed to load results' });
    }
});

// Fees - Get student fees
app.get('/api/fees/student', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token && !isTokenBlacklisted(token)) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            let user = await store.findUserById(decoded.id);
            if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
            if (user) admissionNumber = user.admissionNumber;
        } catch (err) {}
    }
    
    const fees = await store.getFeesByAdmission(admissionNumber);
    let totalPaid = 0, totalBalance = 0;
    fees.forEach(f => { totalPaid += f.amountPaid; totalBalance += f.balance; });
    
    res.json({ success: true, fees, summary: { totalPaid, totalBalance } });
});

// Announcements - Get all (global — not filtered by branch)
app.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await store.getAnnouncements();
        res.json({ success: true, announcements });
    } catch (err) {
        console.error('Get announcements error:', err);
        res.status(500).json({ success: false, message: 'Failed to load announcements' });
    }
});

// ============ TIMETABLES ============

// Student/Teacher: get timetable for a class (shared, DB-driven)
app.get('/api/timetable', async (req, res) => {
    try {
        const filter = { class: req.query.class, session: req.query.session, term: req.query.term, branch: req.query.branch };
        const timetable = await store.getTimetable(filter);
        res.json({ success: true, timetable: timetable || null });
    } catch (err) {
        console.error('Get timetable error:', err);
        res.status(500).json({ success: false, message: 'Failed to load timetable' });
    }
});

// Admin: get all timetables
app.get('/api/timetables', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const timetables = await store.getAllTimetables(filter);
        res.json({ success: true, timetables });
    } catch (err) {
        console.error('Get timetables error:', err);
        res.status(500).json({ success: false, message: 'Failed to load timetables' });
    }
});

// Admin: create/edit a class timetable (upsert by class+session+term)
app.post('/api/timetable', requireRole('admin'), async (req, res) => {
    const { class: cls, session, term, schedule, dismissalTimes, branch } = req.body;
    if (!cls || !Array.isArray(schedule)) {
        return res.status(400).json({ success: false, message: 'Class and schedule are required' });
    }
    try {
        const timetable = await store.upsertTimetable({ class: cls, session, term, schedule, dismissalTimes, branch: branch || 'secondary' });
        res.status(200).json({ success: true, timetable });
    } catch (err) {
        console.error('Save timetable error:', err);
        res.status(500).json({ success: false, message: 'Failed to save timetable' });
    }
});

// ============ ASSIGNMENTS ============

// Student/Teacher/Admin: get assignments (optionally filtered by class)
app.get('/api/assignments', async (req, res) => {
    try {
        const filter = {};
        if (req.query.class) filter.class = req.query.class;
        if (req.query.session) filter.session = req.query.session;
        if (req.query.term) filter.term = req.query.term;
        if (req.query.branch) filter.branch = req.query.branch;
        const assignments = await store.getAssignments(filter);
        res.json({ success: true, assignments });
    } catch (err) {
        console.error('Get assignments error:', err);
        res.status(500).json({ success: false, message: 'Failed to load assignments' });
    }
});

// Admin: get all assignments (including inactive)
app.get('/api/assignments/all', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const assignments = await store.getAllAssignments(filter);
        res.json({ success: true, assignments });
    } catch (err) {
        console.error('Get all assignments error:', err);
        res.status(500).json({ success: false, message: 'Failed to load assignments' });
    }
});

// Teacher: post a new assignment (teacher only)
app.post('/api/assignments', requireRole('teacher'), async (req, res) => {
    const decoded = req.user;
    let user = await store.findUserById(decoded.id);
    if (!user) user = Object.values(demoUsers).find(u => u.id === decoded.id);
    const { title, description, subject, class: cls, session, term, dueDate, totalMarks, branch } = req.body;
    if (!title || !subject || !cls) {
        return res.status(400).json({ success: false, message: 'Title, subject and class are required' });
    }
    try {
        const assignment = await store.createAssignment({
            title, description, subject, class: cls, session, term, dueDate, totalMarks,
            branch: branch || (user ? user.branch : 'secondary'),
            postedBy: user ? `${user.firstName} ${user.lastName}` : 'Teacher'
        });
        res.status(201).json({ success: true, assignment });
    } catch (err) {
        console.error('Create assignment error:', err);
        res.status(500).json({ success: false, message: 'Failed to create assignment' });
    }
});

// Teacher/Admin: delete an assignment
app.delete('/api/assignments/:id', requireRole('teacher', 'admin'), async (req, res) => {
    try {
        const ok = await store.deleteAssignment(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: 'Assignment not found' });
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (err) {
        console.error('Delete assignment error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete assignment' });
    }
});

// Attendance - Get student attendance
app.get('/api/attendance/student', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token && !isTokenBlacklisted(token)) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = Object.values(demoUsers).find(u => u.id === decoded.id);
            if (user) admissionNumber = user.admissionNumber;
        } catch (err) {}
    }
    
    const attendance = demoAttendance.filter(a => a.admissionNumber === admissionNumber);
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
    
    res.json({
        success: true,
        attendance,
        summary: { totalDays, presentDays, absentDays, lateDays, percentage: parseFloat(percentage) }
    });
});

// Get all students (optional ?class=SS1 filter)
app.get('/api/students', requireRole('admin', 'teacher'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.class) filter.class = req.query.class;
        if (req.query.branch) filter.branch = req.query.branch;
        const students = await store.getStudents(filter);
        res.json({ success: true, students, total: students.length });
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ success: false, message: 'Failed to load students' });
    }
});

// Get all teachers
app.get('/api/teachers', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const teachers = await store.getTeachers(filter);
        res.json({ success: true, teachers, total: teachers.length });
    } catch (err) {
        console.error('Get teachers error:', err);
        res.status(500).json({ success: false, message: 'Failed to load teachers' });
    }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const statistics = await store.getStatistics(filter);
        res.json({ success: true, statistics });
    } catch (err) {
        console.error('Get statistics error:', err);
        res.status(500).json({ success: false, message: 'Failed to load statistics' });
    }
});

// Admin - Dashboard stats (admin only)
app.get('/api/admin/dashboard', requireRole('admin'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = req.query.branch;
        const stats = await store.getStatistics(filter);
        res.json({
            success: true,
            stats: {
                totalStudents: stats.totalStudents,
                totalTeachers: stats.totalTeachers,
                totalAdmins: 1,
                recentStudents: (await store.getStudents(filter)).slice(0, 3),
                activeSession: { name: '2025/2026', currentTerm: 'Second Term' }
            }
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
});

// ============ HTML PAGES ============

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views', 'about.html')));
app.get('/admissions', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admissions.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'views', 'gallery.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views', 'contact.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html')));
app.get('/teacher-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'teacher-dashboard.html')));
app.get('/results', (req, res) => res.sendFile(path.join(__dirname, 'views', 'results.html')));
app.get('/fees', (req, res) => res.sendFile(path.join(__dirname, 'views', 'fees.html')));
app.get('/admission-form', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admission-form.html')));

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Export for serverless (Vercel @vercel/node) deployments
module.exports = app;
