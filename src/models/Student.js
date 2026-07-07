// Student Model - Extended student profile
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admissionNumber: {
        type: String,
        required: true,
        unique: true
    },
    class: {
        type: String,
        required: true
    },
    classArm: {
        type: String,
        default: 'A'
    },
    session: {
        type: String,
        required: true
    },
    term: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        default: 'First Term'
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    parentName: String,
    parentPhone: String,
    parentEmail: String,
    address: String,
    bloodGroup: String,
    medicalConditions: String,
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'transferred'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
