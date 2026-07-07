// Assignment Routes
const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/assignments/student
// @desc    Get student's assignments
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const Student = require('../models/Student');
        const student = await Student.findOne({ user: req.user.id });
        
        const assignments = await Assignment.find({
            class: student.class,
            isActive: true
        }).populate('postedBy', 'firstName lastName');
        
        res.json({ success: true, assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/assignments/teacher
// @desc    Get teacher's assignments
// @access  Private (Teacher)
router.get('/teacher', protect, authorize('teacher'), async (req, res) => {
    try {
        const assignments = await Assignment.find({ postedBy: req.user.id })
            .populate('postedBy', 'firstName lastName');
        res.json({ success: true, assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/assignments
// @desc    Create assignment
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const assignment = await Assignment.create({
            ...req.body,
            postedBy: req.user.id
        });
        res.status(201).json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        
        assignment.submissions.push({
            student: req.user.id,
            admissionNumber: user.admissionNumber,
            submittedAt: new Date()
        });
        
        await assignment.save();
        res.json({ success: true, message: 'Assignment submitted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher, Admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Assignment deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
