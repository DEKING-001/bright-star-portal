// Result Routes
const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/results/student
// @desc    Get student results
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const { session, term } = req.query;
        const user = await require('../models/User').findById(req.user.id);
        
        let query = { admissionNumber: user.admissionNumber };
        if (session) query.session = session;
        if (term) query.term = term;
        
        const results = await Result.find(query).sort({ subject: 1 });
        
        // Calculate total and average
        let totalScore = 0;
        let totalSubjects = results.length;
        results.forEach(r => totalScore += r.totalScore);
        const average = totalSubjects > 0 ? (totalScore / totalSubjects).toFixed(2) : 0;
        
        // Calculate class position
        const allResults = await Result.aggregate([
            { $match: { session: results[0]?.session, term: results[0]?.term, class: results[0]?.class } },
            { $group: { _id: '$admissionNumber', total: { $sum: '$totalScore' } } },
            { $sort: { total: -1 } }
        ]);
        
        let position = 0;
        allResults.forEach((r, idx) => {
            if (r._id === user.admissionNumber) position = idx + 1;
        });
        
        res.json({
            success: true,
            results,
            summary: {
                totalScore,
                average: parseFloat(average),
                position,
                totalSubjects
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/results
// @desc    Upload results
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const result = await Result.create({
            ...req.body,
            uploadedBy: req.user.id
        });
        res.status(201).json({ success: true, result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/results/:id
// @desc    Update result
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/results/:id/approve
// @desc    Approve result
// @access  Private (Admin)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const result = await Result.findByIdAndUpdate(
            req.params.id,
            { approved: true, approvedBy: req.user.id },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/results/class
// @desc    Get class results
// @access  Private (Teacher, Admin)
router.get('/class', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { class: studentClass, session, term, subject } = req.query;
        let query = {};
        
        if (studentClass) query.class = studentClass;
        if (session) query.session = session;
        if (term) query.term = term;
        if (subject) query.subject = subject;
        
        const results = await Result.find(query).populate('student').sort({ totalScore: -1 });
        res.json({ success: true, count: results.length, results });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/results/:id
// @desc    Delete result
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }
        res.json({ success: true, message: 'Result deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
