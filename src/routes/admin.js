// Admin Routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const AcademicSession = require('../models/AcademicSession');
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        
        const recentStudents = await Student.find()
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const activeSession = await AcademicSession.findOne({ isActive: true });
        
        res.json({
            success: true,
            stats: {
                totalStudents,
                totalTeachers,
                totalAdmins,
                recentStudents,
                activeSession
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/sessions
// @desc    Create academic session
// @access  Private (Admin)
router.post('/sessions', protect, authorize('admin'), async (req, res) => {
    try {
        const session = await AcademicSession.create(req.body);
        res.status(201).json({ success: true, session });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/sessions
// @desc    Get all sessions
// @access  Private (Admin)
router.get('/sessions', protect, authorize('admin'), async (req, res) => {
    try {
        const sessions = await AcademicSession.find().sort({ startDate: -1 });
        res.json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/sessions/:id
// @desc    Update session
// @access  Private (Admin)
router.put('/sessions/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const session = await AcademicSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, session });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
