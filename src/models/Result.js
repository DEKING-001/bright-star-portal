// Result Model - Student examination results
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    admissionNumber: {
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
    subject: {
        type: String,
        required: true
    },
    ca1: {
        type: Number,
        default: 0,
        min: 0,
        max: 20
    },
    ca2: {
        type: Number,
        default: 0,
        min: 0,
        max: 20
    },
    exam: {
        type: Number,
        default: 0,
        min: 0,
        max: 60
    },
    totalScore: {
        type: Number,
        default: 0
    },
    grade: String,
    remark: String,
    teacherRemark: String,
    principalRemark: String,
    classPosition: Number,
    approved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate total score before saving
resultSchema.pre('save', function(next) {
    this.totalScore = this.ca1 + this.ca2 + this.exam;
    
    // Calculate grade based on total score
    if (this.totalScore >= 70) this.grade = 'A';
    else if (this.totalScore >= 60) this.grade = 'B';
    else if (this.totalScore >= 50) this.grade = 'C';
    else if (this.totalScore >= 40) this.grade = 'D';
    else if (this.totalScore >= 30) this.grade = 'E';
    else this.grade = 'F';
    
    next();
});

module.exports = mongoose.model('Result', resultSchema);
