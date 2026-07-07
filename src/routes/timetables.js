// Timetable Routes
const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/timetables/student
// @desc    Get student's class timetable
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const Student = require('../models/Student');
        const student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const timetable = await Timetable.findOne({
            class: student.class,
            session: student.session,
            term: student.term
        });
        
        res.json({ success: true, timetable });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/timetables
// @desc    Create timetable
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const timetable = await Timetable.create({
            ...req.body,
            createdBy: req.user.id
        });
        res.status(201).json({ success: true, timetable });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/timetables/:id
// @desc    Update timetable
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, timetable });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
