// Attendance Routes
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/attendance/student
// @desc    Get student attendance
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        const attendance = await Attendance.find({ admissionNumber: user.admissionNumber })
            .sort({ date: -1 });
        
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const absentDays = attendance.filter(a => a.status === 'absent').length;
        const lateDays = attendance.filter(a => a.status === 'late').length;
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
        
        res.json({
            success: true,
            attendance,
            summary: {
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                percentage: parseFloat(percentage)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { admissionNumber, class: studentClass, date, status, remark } = req.body;
        
        const attendance = await Attendance.findOneAndUpdate(
            { admissionNumber, date },
            {
                admissionNumber,
                class: studentClass,
                date,
                status,
                remark,
                markedBy: req.user.id
            },
            { new: true, upsert: true }
        );
        
        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/attendance/class
// @desc    Get class attendance
// @access  Private (Teacher, Admin)
router.get('/class', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { class: studentClass, date } = req.query;
        let query = {};
        
        if (studentClass) query.class = studentClass;
        if (date) query.date = new Date(date);
        
        const attendance = await Attendance.find(query).populate('student');
        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
