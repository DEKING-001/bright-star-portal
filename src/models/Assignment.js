// Assignment Model - Student assignments
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    subject: {
        type: String,
        required: true
    },
    class: {
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
    dueDate: {
        type: Date,
        required: true
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    attachment: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        admissionNumber: String,
        submittedAt: Date,
        file: String,
        marks: Number,
        feedback: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
