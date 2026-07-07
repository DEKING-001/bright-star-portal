// Academic Session Model
const mongoose = require('mongoose');

const academicSessionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    currentTerm: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        default: 'First Term'
    },
    terms: [{
        name: String,
        startDate: Date,
        endDate: Date,
        isActive: Boolean
    }],
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AcademicSession', academicSessionSchema);
