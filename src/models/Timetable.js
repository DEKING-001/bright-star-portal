// Timetable Model - Class schedules
const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
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
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            required: true
        },
        periods: [{
            time: String,
            subject: String,
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teacher'
            },
            teacherName: String,
            room: String
        }]
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
