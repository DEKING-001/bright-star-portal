// Announcement Routes
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Public
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isPublished: true })
            .populate('postedBy', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, announcements });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (Admin, Teacher)
router.post('/', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const announcement = await Announcement.create({
            ...req.body,
            postedBy: req.user.id
        });
        res.status(201).json({ success: true, announcement });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, announcement });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
