// Portal-specific Mongoose models that match the running server's data shapes.
// These are intentionally separate from the legacy src/models/* (which expect
// ObjectId user refs) so the existing demo data migrates cleanly.
const mongoose = require('mongoose');

const portalStudentSchema = new mongoose.Schema({
    admissionNumber: { type: String, required: true, unique: true },
    class: String,
    session: String,
    term: String,
    gender: String,
    parentName: String,
    parentPhone: String,
    user: {
        firstName: String,
        lastName: String,
        email: String
    }
}, { timestamps: true });

const portalTeacherSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true },
    department: String,
    subjects: [String],
    qualification: String,
    experience: Number,
    status: String,
    user: {
        firstName: String,
        lastName: String,
        email: String
    }
}, { timestamps: true });

// A single result "batch" uploaded by a teacher for one class/subject/term/session.
const studentResultSchema = new mongoose.Schema({
    admissionNumber: String,
    ca1: Number,
    ca2: Number,
    exam: Number,
    total: Number
}, { _id: false });

const resultUploadSchema = new mongoose.Schema({
    class: String,
    subject: String,
    session: String,
    term: String,
    status: { type: String, default: 'pending_verification' },
    students: [studentResultSchema],
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true });

const portalAnnouncementSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    createdAt: Date
}, { timestamps: true });

const portalFeeSchema = new mongoose.Schema({
    admissionNumber: String,
    session: String,
    term: String,
    totalFee: Number,
    amountPaid: Number,
    balance: Number,
    status: String,
    paymentHistory: [{
        amount: Number,
        date: Date,
        method: String,
        reference: String
    }]
}, { timestamps: true });

module.exports = {
    PortalStudent: mongoose.model('PortalStudent', portalStudentSchema),
    PortalTeacher: mongoose.model('PortalTeacher', portalTeacherSchema),
    ResultUpload: mongoose.model('ResultUpload', resultUploadSchema),
    PortalAnnouncement: mongoose.model('PortalAnnouncement', portalAnnouncementSchema),
    PortalFee: mongoose.model('PortalFee', portalFeeSchema)
};
