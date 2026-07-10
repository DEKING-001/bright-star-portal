// Bright Star International School Portal - Main Server
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bright_star_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Demo Users Database
const demoUsers = {
    'admin@brightstar.com': { id: '1', email: 'admin@brightstar.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
    'TCH/001': { id: '2', email: 'john.owens@brightstar.com', password: 'password123', firstName: 'John', lastName: 'Owens', role: 'teacher', staffId: 'TCH/001' },
    'BSS/2026/001': { id: '3', email: 'chukwuemeka@student.com', password: 'password123', firstName: 'Chukwuemeka', lastName: 'Okonkwo', role: 'student', admissionNumber: 'BSS/2026/001', class: 'SS1', session: '2025/2026', term: 'Second Term' },
    'BSS/2026/002': { id: '4', email: 'amina@student.com', password: 'password123', firstName: 'Amina', lastName: 'Ibrahim', role: 'student', admissionNumber: 'BSS/2026/002', class: 'SS1', session: '2025/2026', term: 'Second Term' }
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

// Generate JWT Token
function generateToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

// ============ API ROUTES ============

// Auth - Login
app.post('/api/auth/login', (req, res) => {
    const { identifier, password, role } = req.body;
    
    const user = demoUsers[identifier];
    
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (role && user.role !== role) {
        return res.status(401).json({ success: false, message: 'Invalid role for this account' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            admissionNumber: user.admissionNumber,
            staffId: user.staffId
        }
    });
});

// Auth - Get current user
app.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = Object.values(demoUsers).find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
});

// Auth - Change Password
app.put('/api/auth/change-password', (req, res) => {
    res.json({ success: true, message: 'Password updated successfully' });
});

// Students - Get profile
app.get('/api/students/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = Object.values(demoUsers).find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const student = demoStudents.find(s => s.admissionNumber === user.admissionNumber);
        res.json({ success: true, student: student || { admissionNumber: user.admissionNumber, class: user.class, session: user.session, term: user.term } });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Not authorized' });
    }
});

// Students - Get all
app.get('/api/students/all', (req, res) => {
    res.json({ success: true, count: demoStudents.length, students: demoStudents });
});

// Students - Create
app.post('/api/students', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const { firstName, lastName, email, admissionNumber: inputAdmissionNo, class: studentClass, gender, password, session, term } = req.body;
    
    if (!firstName || !lastName) {
        return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }
    
    // Auto-generate admission number if not provided
    let admissionNumber = inputAdmissionNo;
    if (!admissionNumber) {
        const currentYear = new Date().getFullYear();
        const yearStudents = demoStudents.filter(s => s.admissionNumber && s.admissionNumber.includes(`BSS/${currentYear}`));
        const nextNumber = yearStudents.length + 1;
        admissionNumber = `BSS/${currentYear}/${String(nextNumber).padStart(3, '0')}`;
    }
    
    const exists = demoStudents.find(s => s.admissionNumber === admissionNumber);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Admission number already exists' });
    }
    
    const newId = String(demoStudents.length + 1);
    const newStudent = {
        _id: newId,
        admissionNumber,
        class: studentClass,
        gender,
        session,
        term,
        parentName: '',
        parentPhone: '',
        user: { firstName, lastName, email }
    };
    
    demoStudents.push(newStudent);
    demoUsers[admissionNumber] = {
        id: newId,
        email,
        password: password || 'password123',
        firstName,
        lastName,
        role: 'student',
        admissionNumber,
        class: studentClass,
        session,
        term
    };
    
    res.status(201).json({ success: true, message: 'Student added successfully', student: newStudent });
});

// Students - Update
app.put('/api/students/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const student = demoStudents.find(s => s._id === req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const { firstName, lastName, email, admissionNumber, class: studentClass, gender, parentName, parentPhone, password } = req.body;
    
    if (firstName) student.user.firstName = firstName;
    if (lastName) student.user.lastName = lastName;
    if (email) student.user.email = email;
    if (admissionNumber) student.admissionNumber = admissionNumber;
    if (studentClass) student.class = studentClass;
    if (gender) student.gender = gender;
    if (parentName) student.parentName = parentName;
    if (parentPhone) student.parentPhone = parentPhone;
    
    // Update demoUsers
    const user = demoUsers[student.admissionNumber] || demoUsers[Object.keys(demoUsers).find(k => demoUsers[k].id === req.params.id)];
    if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (password) user.password = password;
        if (studentClass) user.class = studentClass;
    }
    
    res.json({ success: true, message: 'Student updated successfully', student });
});

// Students - Delete
app.delete('/api/students/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const index = demoStudents.findIndex(s => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const student = demoStudents[index];
    delete demoUsers[student.admissionNumber];
    demoStudents.splice(index, 1);
    
    res.json({ success: true, message: 'Student deleted successfully' });
});

// Teachers - Get all
app.get('/api/teachers/all', (req, res) => {
    res.json({ success: true, count: demoTeachers.length, teachers: demoTeachers });
});

// Teachers - Create
app.post('/api/teachers', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const { firstName, lastName, email, staffId, department, password } = req.body;
    
    if (!firstName || !lastName || !staffId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const exists = demoTeachers.find(t => t.staffId === staffId);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Staff ID already exists' });
    }
    
    const newId = String(demoTeachers.length + 10);
    const newTeacher = {
        _id: newId,
        staffId,
        department,
        subjects: [],
        qualification: '',
        experience: 0,
        status: 'active',
        user: { firstName, lastName, email }
    };
    
    demoTeachers.push(newTeacher);
    demoUsers[staffId] = {
        id: newId,
        email,
        password: password || 'password123',
        firstName,
        lastName,
        role: 'teacher',
        staffId
    };
    
    res.status(201).json({ success: true, message: 'Teacher added successfully', teacher: newTeacher });
});

// Teachers - Update
app.put('/api/teachers/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const teacher = demoTeachers.find(t => t._id === req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    const { firstName, lastName, email, staffId, department, qualification, password } = req.body;
    
    if (firstName) teacher.user.firstName = firstName;
    if (lastName) teacher.user.lastName = lastName;
    if (email) teacher.user.email = email;
    if (staffId) teacher.staffId = staffId;
    if (department) teacher.department = department;
    if (qualification) teacher.qualification = qualification;
    
    // Update demoUsers
    const user = demoUsers[teacher.staffId] || demoUsers[Object.keys(demoUsers).find(k => demoUsers[k].id === req.params.id)];
    if (user) {
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (password) user.password = password;
    }
    
    res.json({ success: true, message: 'Teacher updated successfully', teacher });
});

// Teachers - Delete
app.delete('/api/teachers/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const index = demoTeachers.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Teacher not found' });
    
    const teacher = demoTeachers[index];
    delete demoUsers[teacher.staffId];
    demoTeachers.splice(index, 1);
    
    res.json({ success: true, message: 'Teacher deleted successfully' });
});

// Announcements - Create
app.post('/api/announcements', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const { title, category, content } = req.body;
    const newId = String(demoAnnouncements.length + 1);
    
    const announcement = {
        _id: newId,
        title,
        category: category || 'general',
        content,
        createdAt: new Date()
    };
    
    demoAnnouncements.unshift(announcement);
    res.status(201).json({ success: true, announcement });
});

// Announcements - Delete
app.delete('/api/announcements/:id', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const index = demoAnnouncements.findIndex(a => a._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Announcement not found' });
    
    demoAnnouncements.splice(index, 1);
    res.json({ success: true, message: 'Announcement deleted' });
});

// Results - Get student results
app.get('/api/results/student', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = Object.values(demoUsers).find(u => u.id === decoded.id);
            if (user) admissionNumber = user.admissionNumber;
        } catch (err) {}
    }
    
    const results = demoResults[admissionNumber] || [];
    let totalScore = 0;
    results.forEach(r => totalScore += r.totalScore);
    const average = results.length > 0 ? (totalScore / results.length).toFixed(2) : 0;
    
    res.json({
        success: true,
        results,
        summary: { totalScore, average: parseFloat(average), position: 5, totalSubjects: results.length }
    });
});

// In-memory store for teacher-uploaded result batches
let demoResultUploads = [];

// Teacher uploads results (Single Batch: upsert into an existing 'pending' record)
app.post('/api/results', (req, res) => {
    const { class: cls, subject, session, term, students, status } = req.body;
    if (!cls || !subject || !Array.isArray(students)) {
        return res.status(400).json({ success: false, message: 'Class, subject and students are required' });
    }

    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    const normalizedStudents = students.map(s => ({
        admissionNumber: s.admissionNumber,
        ca1: Number(s.ca1) || 0,
        ca2: Number(s.ca2) || 0,
        exam: Number(s.exam) || 0,
        total: (Number(s.ca1) || 0) + (Number(s.ca2) || 0) + (Number(s.exam) || 0)
    }));

    // 1. Check for an existing PENDING record matching [Class, Subject, Term, Session]
    const existing = demoResultUploads.find(r =>
        r.class === cls &&
        r.subject === subject &&
        r.session === normSession &&
        r.term === normTerm &&
        r.status === 'pending_verification'
    );

    if (existing) {
        // 2a. Found -> merge/upsert new student results into the existing record
        normalizedStudents.forEach(ns => {
            const idx = existing.students.findIndex(s => s.admissionNumber === ns.admissionNumber);
            if (idx !== -1) {
                existing.students[idx] = ns; // update existing student
            } else {
                existing.students.push(ns);  // add new student
            }
        });
        existing.updatedAt = new Date();
        return res.status(200).json({ success: true, updated: true, upload: existing });
    }

    // 2b. Not found -> create a NEW database entry
    const upload = {
        _id: 'RU' + (demoResultUploads.length + 1),
        class: cls,
        subject,
        session: normSession,
        term: normTerm,
        status: status || 'pending_verification',
        students: normalizedStudents,
        createdAt: new Date()
    };
    demoResultUploads.push(upload);
    res.status(201).json({ success: true, created: true, upload });
});

// Admin: fetch only result records pending verification
app.get('/api/results/pending', (req, res) => {
    const pending = demoResultUploads.filter(r => r.status === 'pending_verification');
    res.json({ success: true, results: pending });
});

// Admin: approve (verify) a result batch
app.post('/api/results/:id/approve', (req, res) => {
    const upload = demoResultUploads.find(r => r._id === req.params.id);
    if (!upload) return res.status(404).json({ success: false, message: 'Result record not found' });
    upload.status = 'verified';
    res.json({ success: true, result: upload });
});

// Fees - Get student fees
app.get('/api/fees/student', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = Object.values(demoUsers).find(u => u.id === decoded.id);
            if (user) admissionNumber = user.admissionNumber;
        } catch (err) {}
    }
    
    const fees = demoFees.filter(f => f.admissionNumber === admissionNumber);
    let totalPaid = 0, totalBalance = 0;
    fees.forEach(f => { totalPaid += f.amountPaid; totalBalance += f.balance; });
    
    res.json({ success: true, fees, summary: { totalPaid, totalBalance } });
});

// Announcements - Get all
app.get('/api/announcements', (req, res) => {
    res.json({ success: true, announcements: demoAnnouncements });
});

// Attendance - Get student attendance
app.get('/api/attendance/student', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    let admissionNumber = 'BSS/2026/001';
    
    if (token) {
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
app.get('/api/students', (req, res) => {
    let students = demoStudents;
    if (req.query.class) {
        students = students.filter(s => s.class === req.query.class);
    }
    res.json({ success: true, students, total: students.length });
});

// Get all teachers
app.get('/api/teachers', (req, res) => {
    res.json({ success: true, teachers: demoTeachers, total: demoTeachers.length });
});

// Get statistics
app.get('/api/statistics', (req, res) => {
    const classStats = {};
    demoStudents.forEach(s => {
        classStats[s.class] = (classStats[s.class] || 0) + 1;
    });
    res.json({
        success: true,
        statistics: {
            totalStudents: demoStudents.length,
            totalTeachers: demoTeachers.length,
            classBreakdown: classStats
        }
    });
});

// Admin - Dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalStudents: demoStudents.length,
            totalTeachers: demoTeachers.length,
            totalAdmins: 1,
            recentStudents: demoStudents.slice(0, 3),
            activeSession: { name: '2025/2026', currentTerm: 'Second Term' }
        }
    });
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
