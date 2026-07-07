// Teacher Routes
const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/teachers/profile
// @desc    Get teacher profile
// @access  Private (Teacher)
router.get('/profile', protect, authorize('teacher'), async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user.id }).populate('user', '-password');
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher profile not found' });
        }
        res.json({ success: true, teacher });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/teachers/all
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('user', '-password');
        res.json({ success: true, count: teachers.length, teachers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/teachers
// @desc    Create teacher
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { email, password, firstName, lastName, staffId, department, subjects, qualification, experience } = req.body;
        
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: 'teacher',
            staffId
        });
        
        const teacher = await Teacher.create({
            user: user._id,
            staffId,
            department,
            subjects,
            qualification,
            experience
        });
        
        res.status(201).json({ success: true, teacher });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        res.json({ success: true, teacher });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }
        
        await User.findByIdAndDelete(teacher.user);
        await Teacher.findByIdAndDelete(req.params.id);
        
        res.json({ success: true, message: 'Teacher deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
