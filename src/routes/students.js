// Student Routes
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/profile', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id }).populate('user', '-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/students/all
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/all', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { class: studentClass, session, term } = req.query;
        let query = {};
        
        if (studentClass) query.class = studentClass;
        if (session) query.session = session;
        if (term) query.term = term;
        
        const students = await Student.find(query).populate('user', '-password');
        res.json({ success: true, count: students.length, students });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private (Admin, Teacher)
router.get('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', '-password');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/students
// @desc    Create student
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { email, password, firstName, lastName, admissionNumber, class: studentClass, classArm, session, term, dateOfBirth, gender, parentName, parentPhone, parentEmail, address } = req.body;
        
        // Create user account
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: 'student',
            admissionNumber
        });
        
        // Create student profile
        const student = await Student.create({
            user: user._id,
            admissionNumber,
            class: studentClass,
            classArm,
            session,
            term,
            dateOfBirth,
            gender,
            parentName,
            parentPhone,
            parentEmail,
            address
        });
        
        res.status(201).json({ success: true, student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/students/stats/overview
// @desc    Get student statistics
// @access  Private (Admin)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ status: 'active' });
        
        const classDistribution = await Student.aggregate([
            { $group: { _id: '$class', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        const genderDistribution = await Student.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                classDistribution,
                genderDistribution
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
