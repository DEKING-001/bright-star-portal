// Fee Routes
const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/fees/student
// @desc    Get student fee records
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        const fees = await Fee.find({ admissionNumber: user.admissionNumber }).sort({ session: -1, term: 1 });
        
        let totalPaid = 0;
        let totalBalance = 0;
        fees.forEach(fee => {
            totalPaid += fee.amountPaid;
            totalBalance += fee.balance;
        });
        
        res.json({
            success: true,
            fees,
            summary: {
                totalPaid,
                totalBalance
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/fees
// @desc    Create fee record
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json({ success: true, fee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/fees/:id/payment
// @desc    Record payment
// @access  Private (Admin)
router.post('/:id/payment', protect, authorize('admin'), async (req, res) => {
    try {
        const { amount, method, reference } = req.body;
        const fee = await Fee.findById(req.params.id);
        
        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }
        
        fee.paymentHistory.push({
            amount,
            method,
            reference,
            receivedBy: req.user.id
        });
        
        fee.amountPaid += amount;
        await fee.save();
        
        res.json({ success: true, fee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/fees/all
// @desc    Get all fee records
// @access  Private (Admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const fees = await Fee.find().populate('student').sort({ createdAt: -1 });
        res.json({ success: true, count: fees.length, fees });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
