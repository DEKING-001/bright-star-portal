// Data access layer.
// Uses MongoDB (Mongoose models) when connected; otherwise falls back to the
// in-memory seed arrays below so the app still runs locally without a database.
const {
    PortalStudent,
    PortalTeacher,
    ResultUpload,
    PortalAnnouncement,
    PortalFee
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
    approveResultUpload
};
