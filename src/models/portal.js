// Portal-specific Mongoose models that match the running server's data shapes.
// These are intentionally separate from the legacy src/models/* (which expect
// ObjectId user refs) so the existing demo data migrates cleanly.
const mongoose = require('mongoose');

const portalStudentSchema = new mongoose.Schema({
    admissionNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: 'password123' },
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
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
    password: { type: String, required: true, default: 'password123' },
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
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
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
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
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
    createdAt: Date
}, { timestamps: true });

const portalFeeSchema = new mongoose.Schema({
    admissionNumber: String,
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
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

// Class timetable (one per class/session/term)
// dismissalTimes: per-day school end time (24h "HH:MM"). Slots ending after
// this time are not part of that day's schedule (e.g. Friday ends at 14:00).
const timetableSchema = new mongoose.Schema({
    class: String,
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
    session: String,
    term: String,
    dismissalTimes: {
        type: Object,
        default: () => ({ Monday: '16:00', Tuesday: '16:00', Wednesday: '16:00', Thursday: '16:00', Friday: '14:00' })
    },
    schedule: [{
        day: String,
        periods: [{
            time: String,
            subject: String,
            teacherName: String,
            room: String
        }]
    }],
    updatedAt: Date
}, { timestamps: true });

// Assignment posted by a teacher, visible to a target class
const assignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    subject: String,
    class: String,
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
    session: String,
    term: String,
    dueDate: Date,
    totalMarks: Number,
    postedBy: String,
    postedAt: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ── Result Processing & Ranking System ──────────────────────────────────
// A ResultBatch groups all student results uploaded together for one
// class/subject/term/session. It tracks the overall approval status.
const resultBatchSchema = new mongoose.Schema({
    class: { type: String, required: true },
    subject: { type: String, required: true },
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
    session: { type: String, required: true },
    term: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    uploadedBy: String,
    uploadedByName: String,
    approvedAt: Date,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Safety-net: only ONE Pending batch allowed per class/subject/term/session.
// Partial unique index — does NOT block Approved batches (allows re-uploads).
resultBatchSchema.index(
    { class: 1, subject: 1, term: 1, session: 1 },
    { unique: true, partialFilterExpression: { status: 'Pending' } }
);

// Individual per-subject result for each student.
// averageScore and position are computed across ALL approved subjects for
// that student in the same class/term/session when the batch is approved.
const individualResultSchema = new mongoose.Schema({
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResultBatch', required: true },
    admissionNumber: { type: String, required: true },
    studentName: String,
    class: { type: String, required: true },
    branch: { type: String, enum: ['nursery', 'secondary'], default: 'secondary' },
    session: { type: String, required: true },
    term: { type: String, required: true },
    subject: { type: String, required: true },
    ca1: { type: Number, default: 0, min: 0, max: 20 },
    ca2: { type: Number, default: 0, min: 0, max: 20 },
    exam: { type: Number, default: 0, min: 0, max: 60 },
    totalScore: { type: Number, default: 0 },
    grade: String,
    remark: String,
    averageScore: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    totalSubjectsTaken: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    uploadedBy: String,
    uploadedByName: String,
    approvedAt: Date
}, { timestamps: true });

// Compound index for fast ranking queries
individualResultSchema.index({ class: 1, session: 1, term: 1, admissionNumber: 1 });
individualResultSchema.index({ batchId: 1 });
individualResultSchema.index({ class: 1, session: 1, term: 1, status: 1 });

module.exports = {
    PortalStudent: mongoose.model('PortalStudent', portalStudentSchema),
    PortalTeacher: mongoose.model('PortalTeacher', portalTeacherSchema),
    ResultUpload: mongoose.model('ResultUpload', resultUploadSchema),
    PortalAnnouncement: mongoose.model('PortalAnnouncement', portalAnnouncementSchema),
    PortalFee: mongoose.model('PortalFee', portalFeeSchema),
    PortalTimetable: mongoose.model('PortalTimetable', timetableSchema),
    PortalAssignment: mongoose.model('PortalAssignment', assignmentSchema),
    StudentResult: mongoose.model('StudentResult', individualResultSchema),
    ResultBatch: mongoose.model('ResultBatch', resultBatchSchema)
};
