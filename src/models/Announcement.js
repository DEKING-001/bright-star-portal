// Announcement Model - School announcements
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'academic', 'events', 'urgent', 'sports'],
        default: 'general'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'students', 'teachers', 'parents'],
        default: 'all'
    },
    targetClass: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    expiresAt: Date,
    attachment: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
