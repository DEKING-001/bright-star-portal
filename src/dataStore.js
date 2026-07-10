// Data access layer.
// Uses MongoDB (Mongoose models) when connected; otherwise falls back to the
// in-memory seed arrays below so the app still runs locally without a database.
const {
    PortalStudent,
    PortalTeacher,
    ResultUpload,
    PortalAnnouncement,
    PortalFee,
    PortalTimetable,
    PortalAssignment
} = require('./models/portal');

// ---------- In-memory fallback seed ----------
const mem = {
    students: [
        { _id: '1', admissionNumber: 'BSS/2026/001', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Okonkwo', parentPhone: '+234 801 234 5678', user: { firstName: 'Chukwuemeka', lastName: 'Okonkwo', email: 'chukwuemeka@student.com' } },
        { _id: '2', admissionNumber: 'BSS/2026/002', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Mr. Ibrahim', parentPhone: '+234 802 345 6789', user: { firstName: 'Amina', lastName: 'Ibrahim', email: 'amina@student.com' } },
        { _id: '3', admissionNumber: 'BSS/2026/003', class: 'JSS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mrs. Adeyemi', parentPhone: '+234 803 456 7890', user: { firstName: 'David', lastName: 'Adeyemi', email: 'david@student.com' } },
        { _id: '4', admissionNumber: 'BSS/2026/004', class: 'SS2', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Alhaji Mohammed', parentPhone: '+234 804 567 8901', user: { firstName: 'Fatima', lastName: 'Mohammed', email: 'fatima@student.com' } },
        { _id: '5', admissionNumber: 'BSS/2026/005', class: 'JSS2', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Dr. Okoro', parentPhone: '+234 805 678 9012', user: { firstName: 'Emmanuel', lastName: 'Okoro', email: 'emmanuel@student.com' } }
    ],
    teachers: [
        { _id: '1', staffId: 'TCH/001', department: 'Science', subjects: ['Mathematics', 'Further Mathematics'], qualification: 'M.Sc Mathematics', experience: 10, status: 'active', user: { firstName: 'John', lastName: 'Owens', email: 'john.owens@brightstar.com' } },
        { _id: '2', staffId: 'TCH/002', department: 'Languages', subjects: ['English Language', 'Literature'], qualification: 'M.A English', experience: 8, status: 'active', user: { firstName: 'Sarah', lastName: 'Adesanya', email: 'sarah.adesanya@brightstar.com' } },
        { _id: '3', staffId: 'TCH/003', department: 'Science', subjects: ['Physics', 'Chemistry'], qualification: 'M.Sc Physics', experience: 12, status: 'active', user: { firstName: 'Michael', lastName: 'Ugbo', email: 'michael.ugbo@brightstar.com' } }
    ],
    announcements: [
        { _id: '1', title: 'Second Term Examinations', content: 'Second term examinations will commence from July 20th to August 1st, 2026.', category: 'academic', createdAt: new Date('2026-07-05') },
        { _id: '2', title: 'Inter-House Sports Competition', content: 'Annual inter-house sports competition will hold on July 15th, 2026.', category: 'sports', createdAt: new Date('2026-07-02') },
        { _id: '3', title: 'Graduation Ceremony 2026', content: 'The graduation ceremony for the class of 2026 will hold on August 5th, 2026.', category: 'events', createdAt: new Date('2026-06-28') }
    ],
    fees: [
        { _id: '1', admissionNumber: 'BSS/2026/001', session: '2025/2026', term: 'Second Term', totalFee: 320000, amountPaid: 150000, balance: 170000, status: 'partial', paymentHistory: [{ amount: 150000, date: new Date('2025-09-15'), method: 'bank_transfer', reference: 'TRF/2025/001' }] },
        { _id: '2', admissionNumber: 'BSS/2026/002', session: '2025/2026', term: 'Second Term', totalFee: 250000, amountPaid: 250000, balance: 0, status: 'paid', paymentHistory: [{ amount: 250000, date: new Date('2025-09-10'), method: 'bank_transfer', reference: 'TRF/2025/002' }] }
    ],
    timetables: [
        {
            _id: '1', class: 'SS1', session: '2025/2026', term: 'Second Term', updatedAt: new Date('2026-07-01'),
            dismissalTimes: { Monday: '16:00', Tuesday: '16:00', Wednesday: '16:00', Thursday: '16:00', Friday: '14:00' },
            schedule: [
                { day: 'Monday', periods: [{ time: '8:00 - 8:40', subject: 'Mathematics' }, { time: '8:45 - 9:25', subject: 'English' }, { time: '9:30 - 10:10', subject: 'Physics' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Biology' }] },
                { day: 'Tuesday', periods: [{ time: '8:00 - 8:40', subject: 'English' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'Chemistry' }, { time: '10:40 - 11:20', subject: 'Biology' }, { time: '11:25 - 12:05', subject: 'Physics' }] },
                { day: 'Wednesday', periods: [{ time: '8:00 - 8:40', subject: 'Physics' }, { time: '8:45 - 9:25', subject: 'English' }, { time: '9:30 - 10:10', subject: 'Mathematics' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Biology' }] },
                { day: 'Thursday', periods: [{ time: '8:00 - 8:40', subject: 'Chemistry' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'Biology' }, { time: '10:40 - 11:20', subject: 'Physics' }, { time: '11:25 - 12:05', subject: 'English' }] },
                { day: 'Friday', periods: [{ time: '8:00 - 8:40', subject: 'Biology' }, { time: '8:45 - 9:25', subject: 'Physics' }, { time: '9:30 - 10:10', subject: 'English' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Agriculture' }] }
            ]
        }
    ],
    assignments: [
        { _id: '1', title: 'Quadratic Equations Worksheet', description: 'Solve all 20 problems on quadratic equations. Show all working steps.', subject: 'Mathematics', class: 'SS1', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-15'), totalMarks: 20, postedBy: 'John Owens', postedAt: new Date('2026-07-02'), isActive: true },
        { _id: '2', title: 'Essay Writing Assignment', description: 'Write a 500-word essay on "The Importance of Education in Modern Society".', subject: 'English Language', class: 'SS1', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-18'), totalMarks: 30, postedBy: 'Sarah Adesanya', postedAt: new Date('2026-07-03'), isActive: true }
    ],
    resultUploads: []
};

let dbConnected = false;
function setDbConnected(v) { dbConnected = v; }
function isDbConnected() { return dbConnected; }

// Seed the DB from the fallback arrays the first time it connects (idempotent).
async function seedIfEmpty() {
    if (!dbConnected) return;
    try {
        if (await PortalStudent.countDocuments() === 0) {
            await PortalStudent.insertMany(mem.students.map(({ _id, ...s }) => s));
        }
        if (await PortalTeacher.countDocuments() === 0) {
            await PortalTeacher.insertMany(mem.teachers.map(({ _id, ...t }) => t));
        }
        if (await PortalAnnouncement.countDocuments() === 0) {
            await PortalAnnouncement.insertMany(mem.announcements.map(({ _id, ...a }) => a));
        }
        if (await PortalFee.countDocuments() === 0) {
            await PortalFee.insertMany(mem.fees.map(({ _id, ...f }) => f));
        }
        if (await PortalTimetable.countDocuments() === 0) {
            await PortalTimetable.insertMany(mem.timetables.map(({ _id, ...t }) => t));
        }
        if (await PortalAssignment.countDocuments() === 0) {
            await PortalAssignment.insertMany(mem.assignments.map(({ _id, ...a }) => a));
        }
    } catch (e) {
        console.error('Seed error:', e.message);
    }
}

// ---------- Students ----------
async function getStudents(filter = {}) {
    if (dbConnected) {
        const q = {};
        if (filter.class) q.class = filter.class;
        return await PortalStudent.find(q).lean();
    }
    return mem.students.filter(s => !filter.class || s.class === filter.class);
}

// ---------- Teachers ----------
async function getTeachers() {
    if (dbConnected) return await PortalTeacher.find().lean();
    return mem.teachers;
}

// ---------- Statistics ----------
async function getStatistics() {
    const students = await getStudents();
    const teachers = await getTeachers();
    const classBreakdown = {};
    students.forEach(s => { classBreakdown[s.class] = (classBreakdown[s.class] || 0) + 1; });
    return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        classBreakdown
    };
}

// ---------- Announcements ----------
async function getAnnouncements() {
    if (dbConnected) return await PortalAnnouncement.find().sort({ createdAt: -1 }).lean();
    return [...mem.announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createAnnouncement({ title, content, category }) {
    if (dbConnected) {
        return await PortalAnnouncement.create({
            title,
            content,
            category: category || 'general',
            createdAt: new Date()
        });
    }
    const ann = { _id: String(mem.announcements.length + 1), title, content, category: category || 'general', createdAt: new Date() };
    mem.announcements.unshift(ann);
    return ann;
}

async function deleteAnnouncement(id) {
    if (dbConnected) {
        const r = await PortalAnnouncement.findByIdAndDelete(id);
        return !!r;
    }
    const idx = mem.announcements.findIndex(a => String(a._id) === String(id));
    if (idx !== -1) { mem.announcements.splice(idx, 1); return true; }
    return false;
}

// ---------- Fees ----------
async function getFeesByAdmission(admissionNumber) {
    if (dbConnected) return await PortalFee.find({ admissionNumber }).lean();
    return mem.fees.filter(f => f.admissionNumber === admissionNumber);
}

// ---------- Timetables ----------
async function getTimetable(filter = {}) {
    if (dbConnected) return await PortalTimetable.findOne(filter).lean();
    return mem.timetables.find(t =>
        (!filter.class || t.class === filter.class) &&
        (!filter.session || t.session === filter.session) &&
        (!filter.term || t.term === filter.term)
    ) || null;
}

async function getAllTimetables() {
    if (dbConnected) return await PortalTimetable.find().lean();
    return mem.timetables;
}

async function upsertTimetable({ class: cls, session, term, schedule, dismissalTimes }) {
    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    if (dbConnected) {
        const existing = await PortalTimetable.findOne({ class: cls, session: normSession, term: normTerm });
        if (existing) {
            existing.schedule = schedule;
            if (dismissalTimes) existing.dismissalTimes = dismissalTimes;
            existing.updatedAt = new Date();
            await existing.save();
            return existing;
        }
        return await PortalTimetable.create({
            class: cls, session: normSession, term: normTerm, schedule,
            dismissalTimes: dismissalTimes || undefined, updatedAt: new Date()
        });
    }
    const existing = mem.timetables.find(t => t.class === cls && t.session === normSession && t.term === normTerm);
    if (existing) {
        existing.schedule = schedule;
        if (dismissalTimes) existing.dismissalTimes = dismissalTimes;
        existing.updatedAt = new Date();
        return existing;
    }
    const t = { _id: String(mem.timetables.length + 1), class: cls, session: normSession, term: normTerm, schedule, updatedAt: new Date() };
    if (dismissalTimes) t.dismissalTimes = dismissalTimes;
    mem.timetables.push(t);
    return t;
}

// ---------- Assignments ----------
async function getAssignments(filter = {}) {
    if (dbConnected) {
        const q = { isActive: true };
        if (filter.class) q.class = filter.class;
        if (filter.session) q.session = filter.session;
        if (filter.term) q.term = filter.term;
        return await PortalAssignment.find(q).sort({ postedAt: -1 }).lean();
    }
    return mem.assignments.filter(a =>
        a.isActive &&
        (!filter.class || a.class === filter.class) &&
        (!filter.session || a.session === filter.session) &&
        (!filter.term || a.term === filter.term)
    );
}

async function getAllAssignments() {
    if (dbConnected) return await PortalAssignment.find().sort({ postedAt: -1 }).lean();
    return mem.assignments;
}

async function createAssignment(data) {
    const payload = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        class: data.class,
        session: data.session || '2025/2026',
        term: data.term || 'Second Term',
        dueDate: data.dueDate,
        totalMarks: data.totalMarks || 100,
        postedBy: data.postedBy || 'Teacher',
        postedAt: new Date(),
        isActive: true
    };
    if (dbConnected) return await PortalAssignment.create(payload);
    const a = { _id: String(mem.assignments.length + 1), ...payload };
    mem.assignments.push(a);
    return a;
}

async function deleteAssignment(id) {
    if (dbConnected) {
        const r = await PortalAssignment.findByIdAndDelete(id);
        return !!r;
    }
    const idx = mem.assignments.findIndex(a => String(a._id) === String(id));
    if (idx !== -1) { mem.assignments.splice(idx, 1); return true; }
    return false;
}

// ---------- Result uploads (pending_verification batch workflow) ----------
function normalizeStudents(students) {
    return (students || []).map(s => ({
        admissionNumber: s.admissionNumber,
        ca1: Number(s.ca1) || 0,
        ca2: Number(s.ca2) || 0,
        exam: Number(s.exam) || 0,
        total: (Number(s.ca1) || 0) + (Number(s.ca2) || 0) + (Number(s.exam) || 0)
    }));
}

async function upsertResultUpload({ class: cls, subject, session, term, students, status }) {
    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    const normalized = normalizeStudents(students);

    if (dbConnected) {
        const existing = await ResultUpload.findOne({
            class: cls,
            subject,
            session: normSession,
            term: normTerm,
            status: 'pending_verification'
        });
        if (existing) {
            normalized.forEach(ns => {
                const idx = existing.students.findIndex(s => s.admissionNumber === ns.admissionNumber);
                if (idx !== -1) existing.students[idx] = ns;
                else existing.students.push(ns);
            });
            existing.updatedAt = new Date();
            await existing.save();
            return { updated: true, upload: existing };
        }
        const upload = await ResultUpload.create({
            class: cls,
            subject,
            session: normSession,
            term: normTerm,
            status: status || 'pending_verification',
            students: normalized,
            createdAt: new Date()
        });
        return { created: true, upload };
    }

    // In-memory fallback
    const existing = mem.resultUploads.find(r =>
        r.class === cls && r.subject === subject && r.session === normSession &&
        r.term === normTerm && r.status === 'pending_verification'
    );
    if (existing) {
        normalized.forEach(ns => {
            const idx = existing.students.findIndex(s => s.admissionNumber === ns.admissionNumber);
            if (idx !== -1) existing.students[idx] = ns;
            else existing.students.push(ns);
        });
        existing.updatedAt = new Date();
        return { updated: true, upload: existing };
    }
    const upload = {
        _id: 'RU' + (mem.resultUploads.length + 1),
        class: cls,
        subject,
        session: normSession,
        term: normTerm,
        status: status || 'pending_verification',
        students: normalized,
        createdAt: new Date()
    };
    mem.resultUploads.push(upload);
    return { created: true, upload };
}

async function getPendingResultUploads() {
    if (dbConnected) return await ResultUpload.find({ status: 'pending_verification' }).lean();
    return mem.resultUploads.filter(r => r.status === 'pending_verification');
}

async function approveResultUpload(id) {
    if (dbConnected) {
        const upload = await ResultUpload.findByIdAndUpdate(id, { status: 'verified' }, { new: true });
        return upload;
    }
    const upload = mem.resultUploads.find(r => String(r._id) === String(id));
    if (upload) upload.status = 'verified';
    return upload;
}

module.exports = {
    setDbConnected,
    isDbConnected,
    seedIfEmpty,
    getStudents,
    getTeachers,
    getStatistics,
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    getFeesByAdmission,
    upsertResultUpload,
    getPendingResultUploads,
    approveResultUpload,
    getTimetable,
    getAllTimetables,
    upsertTimetable,
    getAssignments,
    getAllAssignments,
    createAssignment,
    deleteAssignment
};
