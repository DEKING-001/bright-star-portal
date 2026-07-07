// Teacher Model - Extended teacher profile
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    department: String,
    subjects: [{
        type: String
    }],
    classesAssigned: [{
        type: String
    }],
    qualification: String,
    experience: Number,
    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
