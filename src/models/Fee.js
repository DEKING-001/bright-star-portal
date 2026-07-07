// Fee Model - School fees payment records
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    admissionNumber: {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        required: true
    },
    totalFee: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    paymentHistory: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        method: {
            type: String,
            enum: ['cash', 'bank_transfer', 'online', 'cheque'],
            default: 'cash'
        },
        reference: String,
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    status: {
        type: String,
        enum: ['paid', 'partial', 'unpaid'],
        default: 'unpaid'
    },
    receiptNumber: String
}, {
    timestamps: true
});

// Update balance and status before saving
feeSchema.pre('save', function(next) {
    this.balance = this.totalFee - this.amountPaid;
    if (this.balance <= 0) this.status = 'paid';
    else if (this.amountPaid > 0) this.status = 'partial';
    else this.status = 'unpaid';
    next();
});

module.exports = mongoose.model('Fee', feeSchema);
