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
    PortalAssignment,
    StudentResult,
    ResultBatch
} = require('./models/portal');

// ---------- In-memory fallback seed ----------
const mem = {
    students: [
        // Secondary branch
        { _id: '1', admissionNumber: 'BSS/2026/001', password: 'password123', branch: 'secondary', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Okonkwo', parentPhone: '+234 801 234 5678', user: { firstName: 'Chukwuemeka', lastName: 'Okonkwo', email: 'chukwuemeka@student.com' } },
        { _id: '2', admissionNumber: 'BSS/2026/002', password: 'password123', branch: 'secondary', class: 'SS1', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Mr. Ibrahim', parentPhone: '+234 802 345 6789', user: { firstName: 'Amina', lastName: 'Ibrahim', email: 'amina@student.com' } },
        { _id: '3', admissionNumber: 'BSS/2026/003', password: 'password123', branch: 'secondary', class: 'JSS1', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mrs. Adeyemi', parentPhone: '+234 803 456 7890', user: { firstName: 'David', lastName: 'Adeyemi', email: 'david@student.com' } },
        { _id: '4', admissionNumber: 'BSS/2026/004', password: 'password123', branch: 'secondary', class: 'SS2', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Alhaji Mohammed', parentPhone: '+234 804 567 8901', user: { firstName: 'Fatima', lastName: 'Mohammed', email: 'fatima@student.com' } },
        { _id: '5', admissionNumber: 'BSS/2026/005', password: 'password123', branch: 'secondary', class: 'JSS2', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Dr. Okoro', parentPhone: '+234 805 678 9012', user: { firstName: 'Emmanuel', lastName: 'Okoro', email: 'emmanuel@student.com' } },
        // Nursery branch
        { _id: '6', admissionNumber: 'BNP/2026/001', password: 'password123', branch: 'nursery', class: 'Nursery 3', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Eze', parentPhone: '+234 806 789 0123', user: { firstName: 'Chinedu', lastName: 'Eze', email: 'chinedu@student.com' } },
        { _id: '7', admissionNumber: 'BNP/2026/002', password: 'password123', branch: 'nursery', class: 'Primary 1', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Mrs. Bello', parentPhone: '+234 807 890 1234', user: { firstName: 'Zainab', lastName: 'Bello', email: 'zainab@student.com' } },
        { _id: '8', admissionNumber: 'BNP/2026/003', password: 'password123', branch: 'nursery', class: 'Primary 2', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Okafor', parentPhone: '+234 808 901 2345', user: { firstName: 'Kenechukwu', lastName: 'Okafor', email: 'kene@student.com' } }
    ],
    teachers: [
        // Secondary branch
        { _id: '1', staffId: 'TCH/001', password: 'password123', branch: 'secondary', department: 'Science', subjects: ['Mathematics', 'Further Mathematics'], qualification: 'M.Sc Mathematics', experience: 10, status: 'active', user: { firstName: 'John', lastName: 'Owens', email: 'john.owens@brightstar.com' } },
        { _id: '2', staffId: 'TCH/002', password: 'password123', branch: 'secondary', department: 'Languages', subjects: ['English Language', 'Literature'], qualification: 'M.A English', experience: 8, status: 'active', user: { firstName: 'Sarah', lastName: 'Adesanya', email: 'sarah.adesanya@brightstar.com' } },
        { _id: '3', staffId: 'TCH/003', password: 'password123', branch: 'secondary', department: 'Science', subjects: ['Physics', 'Chemistry'], qualification: 'M.Sc Physics', experience: 12, status: 'active', user: { firstName: 'Michael', lastName: 'Ugbo', email: 'michael.ugbo@brightstar.com' } },
        // Nursery branch
        { _id: '4', staffId: 'TCH/N/001', password: 'password123', branch: 'nursery', department: 'Early Years', subjects: ['General Studies', 'Creative Arts'], qualification: 'B.Ed Early Childhood', experience: 6, status: 'active', user: { firstName: 'Ngozi', lastName: 'Okafor', email: 'ngozi.okafor@brightstar.com' } },
        { _id: '5', staffId: 'TCH/N/002', password: 'password123', branch: 'nursery', department: 'Primary', subjects: ['Mathematics', 'English Language'], qualification: 'B.Sc Education', experience: 5, status: 'active', user: { firstName: 'Aisha', lastName: 'Mohammed', email: 'aisha.mohammed@brightstar.com' } }
    ],
    announcements: [
        // Secondary announcements
        { _id: '1', title: 'Second Term Examinations', content: 'Second term examinations will commence from July 20th to August 1st, 2026.', category: 'academic', branch: 'secondary', createdAt: new Date('2026-07-05') },
        { _id: '2', title: 'Inter-House Sports Competition', content: 'Annual inter-house sports competition will hold on July 15th, 2026.', category: 'sports', branch: 'secondary', createdAt: new Date('2026-07-02') },
        { _id: '3', title: 'Graduation Ceremony 2026', content: 'The graduation ceremony for the class of 2026 will hold on August 5th, 2026.', category: 'events', branch: 'secondary', createdAt: new Date('2026-06-28') },
        // Nursery announcements
        { _id: '4', title: 'Nursery End-of-Term Party', content: 'End-of-term party for nursery and primary pupils will hold on July 25th, 2026.', category: 'events', branch: 'nursery', createdAt: new Date('2026-07-03') },
        { _id: '5', title: 'Parent-Teacher Meeting', content: 'Parent-teacher meeting for nursery and primary section is scheduled for July 18th, 2026.', category: 'academic', branch: 'nursery', createdAt: new Date('2026-07-01') }
    ],
    fees: [
        // Secondary fees
        { _id: '1', admissionNumber: 'BSS/2026/001', branch: 'secondary', session: '2025/2026', term: 'Second Term', totalFee: 320000, amountPaid: 150000, balance: 170000, status: 'partial', paymentHistory: [{ amount: 150000, date: new Date('2025-09-15'), method: 'bank_transfer', reference: 'TRF/2025/001' }] },
        { _id: '2', admissionNumber: 'BSS/2026/002', branch: 'secondary', session: '2025/2026', term: 'Second Term', totalFee: 250000, amountPaid: 250000, balance: 0, status: 'paid', paymentHistory: [{ amount: 250000, date: new Date('2025-09-10'), method: 'bank_transfer', reference: 'TRF/2025/002' }] },
        // Nursery fees
        { _id: '3', admissionNumber: 'BNP/2026/001', branch: 'nursery', session: '2025/2026', term: 'Second Term', totalFee: 150000, amountPaid: 100000, balance: 50000, status: 'partial', paymentHistory: [{ amount: 100000, date: new Date('2025-09-12'), method: 'bank_transfer', reference: 'TRF/2025/003' }] },
        { _id: '4', admissionNumber: 'BNP/2026/002', branch: 'nursery', session: '2025/2026', term: 'Second Term', totalFee: 120000, amountPaid: 120000, balance: 0, status: 'paid', paymentHistory: [{ amount: 120000, date: new Date('2025-09-08'), method: 'cash', reference: 'CASH/2025/001' }] }
    ],
    timetables: [
        // Secondary timetable
        {
            _id: '1', class: 'SS1', branch: 'secondary', session: '2025/2026', term: 'Second Term', updatedAt: new Date('2026-07-01'),
            dismissalTimes: { Monday: '16:00', Tuesday: '16:00', Wednesday: '16:00', Thursday: '16:00', Friday: '14:00' },
            schedule: [
                { day: 'Monday', periods: [{ time: '8:00 - 8:40', subject: 'Mathematics' }, { time: '8:45 - 9:25', subject: 'English' }, { time: '9:30 - 10:10', subject: 'Physics' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Biology' }] },
                { day: 'Tuesday', periods: [{ time: '8:00 - 8:40', subject: 'English' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'Chemistry' }, { time: '10:40 - 11:20', subject: 'Biology' }, { time: '11:25 - 12:05', subject: 'Physics' }] },
                { day: 'Wednesday', periods: [{ time: '8:00 - 8:40', subject: 'Physics' }, { time: '8:45 - 9:25', subject: 'English' }, { time: '9:30 - 10:10', subject: 'Mathematics' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Biology' }] },
                { day: 'Thursday', periods: [{ time: '8:00 - 8:40', subject: 'Chemistry' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'Biology' }, { time: '10:40 - 11:20', subject: 'Physics' }, { time: '11:25 - 12:05', subject: 'English' }] },
                { day: 'Friday', periods: [{ time: '8:00 - 8:40', subject: 'Biology' }, { time: '8:45 - 9:25', subject: 'Physics' }, { time: '9:30 - 10:10', subject: 'English' }, { time: '10:40 - 11:20', subject: 'Chemistry' }, { time: '11:25 - 12:05', subject: 'Agriculture' }] }
            ]
        },
        // Nursery timetable
        {
            _id: '2', class: 'Primary 1', branch: 'nursery', session: '2025/2026', term: 'Second Term', updatedAt: new Date('2026-07-01'),
            dismissalTimes: { Monday: '14:00', Tuesday: '14:00', Wednesday: '14:00', Thursday: '14:00', Friday: '12:00' },
            schedule: [
                { day: 'Monday', periods: [{ time: '8:00 - 8:40', subject: 'General Studies' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'English Language' }, { time: '10:20 - 11:00', subject: 'Creative Arts' }, { time: '11:05 - 11:45', subject: 'Physical Education' }] },
                { day: 'Tuesday', periods: [{ time: '8:00 - 8:40', subject: 'Mathematics' }, { time: '8:45 - 9:25', subject: 'English Language' }, { time: '9:30 - 10:10', subject: 'General Studies' }, { time: '10:20 - 11:00', subject: 'Music' }, { time: '11:05 - 11:45', subject: 'Creative Arts' }] },
                { day: 'Wednesday', periods: [{ time: '8:00 - 8:40', subject: 'English Language' }, { time: '8:45 - 9:25', subject: 'General Studies' }, { time: '9:30 - 10:10', subject: 'Mathematics' }, { time: '10:20 - 11:00', subject: 'Physical Education' }, { time: '11:05 - 11:45', subject: 'Creative Arts' }] },
                { day: 'Thursday', periods: [{ time: '8:00 - 8:40', subject: 'General Studies' }, { time: '8:45 - 9:25', subject: 'Mathematics' }, { time: '9:30 - 10:10', subject: 'Creative Arts' }, { time: '10:20 - 11:00', subject: 'English Language' }, { time: '11:05 - 11:45', subject: 'Music' }] },
                { day: 'Friday', periods: [{ time: '8:00 - 8:40', subject: 'Mathematics' }, { time: '8:45 - 9:25', subject: 'English Language' }, { time: '9:30 - 10:10', subject: 'Physical Education' }, { time: '10:20 - 11:00', subject: 'General Studies' }] }
            ]
        }
    ],
    assignments: [
        // Secondary assignments
        { _id: '1', title: 'Quadratic Equations Worksheet', description: 'Solve all 20 problems on quadratic equations. Show all working steps.', subject: 'Mathematics', class: 'SS1', branch: 'secondary', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-15'), totalMarks: 20, postedBy: 'John Owens', postedAt: new Date('2026-07-02'), isActive: true },
        { _id: '2', title: 'Essay Writing Assignment', description: 'Write a 500-word essay on "The Importance of Education in Modern Society".', subject: 'English Language', class: 'SS1', branch: 'secondary', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-18'), totalMarks: 30, postedBy: 'Sarah Adesanya', postedAt: new Date('2026-07-03'), isActive: true },
        // Nursery assignments
        { _id: '3', title: 'Coloring Activity', description: 'Color the pictures of animals and label them correctly.', subject: 'Creative Arts', class: 'Primary 1', branch: 'nursery', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-16'), totalMarks: 10, postedBy: 'Ngozi Okafor', postedAt: new Date('2026-07-04'), isActive: true },
        { _id: '4', title: 'Number Recognition Worksheet', description: 'Complete the number tracing exercises from 1 to 20.', subject: 'Mathematics', class: 'Primary 1', branch: 'nursery', session: '2025/2026', term: 'Second Term', dueDate: new Date('2026-07-17'), totalMarks: 10, postedBy: 'Aisha Mohammed', postedAt: new Date('2026-07-04'), isActive: true }
    ],
    resultUploads: [],
    resultBatches: [],
    studentResults: []
};

let dbConnected = false;
function setDbConnected(v) { dbConnected = v; }

// Helper: try MongoDB query, fall back to in-memory on failure
async function tryMongoDB(queryFn, fallbackFn) {
    if (dbConnected) {
        try {
            return await queryFn();
        } catch (err) {
            console.error('MongoDB query failed, falling back to in-memory:', err.message);
        }
    }
    return fallbackFn();
}
function isDbConnected() { return dbConnected; }

// Seed the DB from the fallback arrays the first time it connects (idempotent).
async function seedIfEmpty() {
    if (!dbConnected) return;
    try {
        // ── Migration: backfill branch on existing records that lack it ──
        // Secondary = 'secondary' for all, then fix nursery specifically
        await PortalStudent.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await PortalTeacher.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await PortalAnnouncement.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await PortalFee.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await PortalTimetable.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await PortalAssignment.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await ResultBatch.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );
        await StudentResult.updateMany(
            { branch: { $exists: false } },
            { $set: { branch: 'secondary' } }
        );

        // ── Fix nursery records that were wrongly backfilled as 'secondary' ──
        const nurseryAdmissionPrefixes = mem.students
            .filter(s => s.branch === 'nursery')
            .map(s => s.admissionNumber);
        if (nurseryAdmissionPrefixes.length > 0) {
            await PortalStudent.updateMany(
                { admissionNumber: { $in: nurseryAdmissionPrefixes } },
                { $set: { branch: 'nursery' } }
            );
        }
        const nurseryStaffIds = mem.teachers
            .filter(t => t.branch === 'nursery')
            .map(t => t.staffId);
        if (nurseryStaffIds.length > 0) {
            await PortalTeacher.updateMany(
                { staffId: { $in: nurseryStaffIds } },
                { $set: { branch: 'nursery' } }
            );
        }

        // Seed only if empty
        if (await PortalStudent.countDocuments() === 0) {
            await PortalStudent.insertMany(mem.students.map(({ _id, ...s }) => ({
                ...s,
                password: s.password || 'password123'
            })));
        }
        if (await PortalTeacher.countDocuments() === 0) {
            await PortalTeacher.insertMany(mem.teachers.map(({ _id, ...t }) => ({
                ...t,
                password: t.password || 'password123'
            })));
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

        // ── Upsert nursery branch demo users (safe to re-run) ──
        const nurseryStudents = mem.students.filter(s => s.branch === 'nursery');
        for (const s of nurseryStudents) {
            const { _id, ...studentData } = s;
            await PortalStudent.findOneAndUpdate(
                { admissionNumber: s.admissionNumber },
                { $setOnInsert: studentData },
                { upsert: true, new: true }
            );
        }
        const nurseryTeachers = mem.teachers.filter(t => t.branch === 'nursery');
        for (const t of nurseryTeachers) {
            const { _id, ...teacherData } = t;
            await PortalTeacher.findOneAndUpdate(
                { staffId: t.staffId },
                { $setOnInsert: teacherData },
                { upsert: true, new: true }
            );
        }
    } catch (e) {
        console.error('Seed error:', e.message);
    }
}

// ---------- Students ----------
async function getStudents(filter = {}) {
    if (dbConnected) {
        try {
            const q = {};
            if (filter.class) q.class = filter.class;
            if (filter.branch) q.branch = filter.branch;
            return await PortalStudent.find(q).lean();
        } catch (err) {
            console.error('MongoDB getStudents failed, falling back to in-memory:', err.message);
        }
    }
    return mem.students.filter(s =>
        (!filter.class || s.class === filter.class) &&
        (!filter.branch || s.branch === filter.branch)
    );
}

// ---------- Teachers ----------
async function getTeachers(filter = {}) {
    if (dbConnected) {
        try {
            const q = {};
            if (filter.branch) q.branch = filter.branch;
            return await PortalTeacher.find(q).lean();
        } catch (err) {
            console.error('MongoDB getTeachers failed, falling back to in-memory:', err.message);
        }
    }
    return mem.teachers.filter(t => !filter.branch || t.branch === filter.branch);
}

// ---------- All Students (no filter) ----------
async function getAllStudents(filter = {}) {
    if (dbConnected) {
        const q = {};
        if (filter.branch) q.branch = filter.branch;
        return await PortalStudent.find(q).lean();
    }
    return mem.students.filter(s => !filter.branch || s.branch === filter.branch);
}

// ---------- Update Student ----------
async function updateStudent(id, data) {
    if (dbConnected) {
        const update = {};
        if (data.firstName || data.lastName || data.email) {
            update.user = {};
            if (data.firstName) update.user.firstName = data.firstName;
            if (data.lastName) update.user.lastName = data.lastName;
            if (data.email) update.user.email = data.email;
        }
        if (data.admissionNumber !== undefined) update.admissionNumber = data.admissionNumber;
        if (data.class !== undefined) update.class = data.class;
        if (data.gender !== undefined) update.gender = data.gender;
        if (data.parentName !== undefined) update.parentName = data.parentName;
        if (data.parentPhone !== undefined) update.parentPhone = data.parentPhone;
        if (data.status !== undefined) update.status = data.status;
        const doc = await PortalStudent.findByIdAndUpdate(id, { $set: update }, { new: true });
        return doc;
    }
    const student = mem.students.find(s => String(s._id) === String(id));
    if (!student) return null;
    if (data.firstName) student.user.firstName = data.firstName;
    if (data.lastName) student.user.lastName = data.lastName;
    if (data.email) student.user.email = data.email;
    if (data.admissionNumber !== undefined) student.admissionNumber = data.admissionNumber;
    if (data.class !== undefined) student.class = data.class;
    if (data.gender !== undefined) student.gender = data.gender;
    if (data.parentName !== undefined) student.parentName = data.parentName;
    if (data.parentPhone !== undefined) student.parentPhone = data.parentPhone;
    return student;
}

// ---------- Delete Student ----------
async function deleteStudent(id) {
    if (dbConnected) {
        const r = await PortalStudent.findByIdAndDelete(id);
        return !!r;
    }
    const idx = mem.students.findIndex(s => String(s._id) === String(id));
    if (idx !== -1) { mem.students.splice(idx, 1); return true; }
    return false;
}

// ---------- Create Student ----------
async function createStudent(data) {
    if (dbConnected) {
        return await PortalStudent.create(data);
    }
    const newId = String(mem.students.length + 1);
    const student = { _id: newId, ...data };
    mem.students.push(student);
    return student;
}

// ---------- Create Teacher ----------
async function createTeacher(data) {
    if (dbConnected) {
        return await PortalTeacher.create(data);
    }
    const newId = String(mem.teachers.length + 1);
    const teacher = { _id: newId, ...data };
    mem.teachers.push(teacher);
    return teacher;
}

// ---------- Find user by identifier (admissionNumber or staffId or email) for auth ----------
async function findUserByIdentifier(identifier) {
    if (dbConnected) {
        try {
            // Try student by admissionNumber
            let doc = await PortalStudent.findOne({ admissionNumber: identifier }).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'student',
                    branch: doc.branch || 'secondary',
                    admissionNumber: doc.admissionNumber,
                    class: doc.class,
                    session: doc.session,
                    term: doc.term
                };
            }
            // Try teacher by staffId
            doc = await PortalTeacher.findOne({ staffId: identifier }).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'teacher',
                    branch: doc.branch || 'secondary',
                    staffId: doc.staffId
                };
            }
            // Try teacher/student by email
            doc = await PortalStudent.findOne({ 'user.email': identifier }).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'student',
                    branch: doc.branch || 'secondary',
                    admissionNumber: doc.admissionNumber,
                    class: doc.class,
                    session: doc.session,
                    term: doc.term
                };
            }
            doc = await PortalTeacher.findOne({ 'user.email': identifier }).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'teacher',
                    branch: doc.branch || 'secondary',
                    staffId: doc.staffId
                };
            }
        } catch (e) {
            // Query error — fall through to in-memory
        }
        return null;
    }
    // In-memory fallback
    return null;
}

// ---------- Find user by id (for auth /me and /verify) ----------
async function findUserById(id) {
    if (dbConnected) {
        try {
            let doc = await PortalStudent.findById(id).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'student',
                    branch: doc.branch || 'secondary',
                    admissionNumber: doc.admissionNumber,
                    class: doc.class,
                    session: doc.session,
                    term: doc.term
                };
            }
            doc = await PortalTeacher.findById(id).lean();
            if (doc) {
                return {
                    id: String(doc._id),
                    email: doc.user?.email,
                    password: doc.password,
                    firstName: doc.user?.firstName,
                    lastName: doc.user?.lastName,
                    role: 'teacher',
                    branch: doc.branch || 'secondary',
                    staffId: doc.staffId
                };
            }
        } catch (e) {
            // CastError if id is not a valid ObjectId — fall through to in-memory
        }
        return null;
    }
    return null;
}

// ---------- Get student profile for auth ----------
async function getStudentByAdmission(admissionNumber) {
    if (dbConnected) {
        return await PortalStudent.findOne({ admissionNumber }).lean();
    }
    return mem.students.find(s => s.admissionNumber === admissionNumber) || null;
}

// ---------- All Teachers (no filter) ----------
async function getAllTeachers(filter = {}) {
    if (dbConnected) {
        const q = {};
        if (filter.branch) q.branch = filter.branch;
        return await PortalTeacher.find(q).lean();
    }
    return mem.teachers.filter(t => !filter.branch || t.branch === filter.branch);
}

// ---------- Update Teacher ----------
async function updateTeacher(id, data) {
    if (dbConnected) {
        const update = {};
        if (data.firstName || data.lastName || data.email) {
            update.user = {};
            if (data.firstName) update.user.firstName = data.firstName;
            if (data.lastName) update.user.lastName = data.lastName;
            if (data.email) update.user.email = data.email;
        }
        if (data.staffId !== undefined) update.staffId = data.staffId;
        if (data.department !== undefined) update.department = data.department;
        if (data.qualification !== undefined) update.qualification = data.qualification;
        if (data.experience !== undefined) update.experience = data.experience;
        if (data.status !== undefined) update.status = data.status;
        const doc = await PortalTeacher.findByIdAndUpdate(id, { $set: update }, { new: true });
        return doc;
    }
    const teacher = mem.teachers.find(t => String(t._id) === String(id));
    if (!teacher) return null;
    if (data.firstName) teacher.user.firstName = data.firstName;
    if (data.lastName) teacher.user.lastName = data.lastName;
    if (data.email) teacher.user.email = data.email;
    if (data.staffId !== undefined) teacher.staffId = data.staffId;
    if (data.department !== undefined) teacher.department = data.department;
    if (data.qualification !== undefined) teacher.qualification = data.qualification;
    return teacher;
}

// ---------- Delete Teacher ----------
async function deleteTeacher(id) {
    if (dbConnected) {
        const r = await PortalTeacher.findByIdAndDelete(id);
        return !!r;
    }
    const idx = mem.teachers.findIndex(t => String(t._id) === String(id));
    if (idx !== -1) { mem.teachers.splice(idx, 1); return true; }
    return false;
}

// ---------- Statistics ----------
async function getStatistics(filter = {}) {
    const students = await getStudents(filter);
    const teachers = await getTeachers(filter);
    const classBreakdown = {};
    students.forEach(s => { classBreakdown[s.class] = (classBreakdown[s.class] || 0) + 1; });
    return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        classBreakdown
    };
}

// ---------- Announcements ----------
async function getAnnouncements(filter = {}) {
    if (dbConnected) {
        try {
            const q = {};
            if (filter.branch) q.branch = filter.branch;
            return await PortalAnnouncement.find(q).sort({ createdAt: -1 }).lean();
        } catch (err) {
            console.error('MongoDB getAnnouncements failed, falling back to in-memory:', err.message);
        }
    }
    return [...mem.announcements]
        .filter(a => !filter.branch || a.branch === filter.branch)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createAnnouncement({ title, content, category, branch }) {
    if (dbConnected) {
        return await PortalAnnouncement.create({
            title,
            content,
            category: category || 'general',
            branch: branch || 'secondary',
            createdAt: new Date()
        });
    }
    const ann = { _id: String(mem.announcements.length + 1), title, content, category: category || 'general', branch: branch || 'secondary', createdAt: new Date() };
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
async function getFeesByAdmission(admissionNumber, filter = {}) {
    return tryMongoDB(
        async () => {
            const q = { admissionNumber };
            if (filter.branch) q.branch = filter.branch;
            return await PortalFee.find(q).lean();
        },
        () => mem.fees.filter(f => f.admissionNumber === admissionNumber && (!filter.branch || f.branch === filter.branch))
    );
}

// ---------- Timetables ----------
async function getTimetable(filter = {}) {
    return tryMongoDB(
        async () => await PortalTimetable.findOne(filter).lean(),
        () => mem.timetables.find(t =>
            (!filter.class || t.class === filter.class) &&
            (!filter.session || t.session === filter.session) &&
            (!filter.term || t.term === filter.term) &&
            (!filter.branch || t.branch === filter.branch)
        ) || null
    );
}

async function getAllTimetables(filter = {}) {
    return tryMongoDB(
        async () => {
            const q = {};
            if (filter.branch) q.branch = filter.branch;
            return await PortalTimetable.find(q).lean();
        },
        () => mem.timetables.filter(t => !filter.branch || t.branch === filter.branch)
    );
}

async function upsertTimetable({ class: cls, session, term, schedule, dismissalTimes, branch }) {
    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    const normBranch = branch || 'secondary';
    if (dbConnected) {
        const existing = await PortalTimetable.findOne({ class: cls, session: normSession, term: normTerm, branch: normBranch });
        if (existing) {
            existing.schedule = schedule;
            if (dismissalTimes) existing.dismissalTimes = dismissalTimes;
            existing.updatedAt = new Date();
            await existing.save();
            return existing;
        }
        return await PortalTimetable.create({
            class: cls, branch: normBranch, session: normSession, term: normTerm, schedule,
            dismissalTimes: dismissalTimes || undefined, updatedAt: new Date()
        });
    }
    const existing = mem.timetables.find(t => t.class === cls && t.session === normSession && t.term === normTerm && t.branch === normBranch);
    if (existing) {
        existing.schedule = schedule;
        if (dismissalTimes) existing.dismissalTimes = dismissalTimes;
        existing.updatedAt = new Date();
        return existing;
    }
    const t = { _id: String(mem.timetables.length + 1), class: cls, branch: normBranch, session: normSession, term: normTerm, schedule, updatedAt: new Date() };
    if (dismissalTimes) t.dismissalTimes = dismissalTimes;
    mem.timetables.push(t);
    return t;
}

// ---------- Assignments ----------
async function getAssignments(filter = {}) {
    return tryMongoDB(
        async () => {
            const q = { isActive: true };
            if (filter.class) q.class = filter.class;
            if (filter.session) q.session = filter.session;
            if (filter.term) q.term = filter.term;
            if (filter.branch) q.branch = filter.branch;
            return await PortalAssignment.find(q).sort({ postedAt: -1 }).lean();
        },
        () => mem.assignments.filter(a =>
            a.isActive &&
            (!filter.class || a.class === filter.class) &&
            (!filter.session || a.session === filter.session) &&
            (!filter.term || a.term === filter.term) &&
            (!filter.branch || a.branch === filter.branch)
        )
    );
}

async function getAllAssignments(filter = {}) {
    return tryMongoDB(
        async () => {
            const q = {};
            if (filter.branch) q.branch = filter.branch;
            return await PortalAssignment.find(q).sort({ postedAt: -1 }).lean();
        },
        () => mem.assignments.filter(a => !filter.branch || a.branch === filter.branch)
    );
}

async function createAssignment(data) {
    const payload = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        class: data.class,
        branch: data.branch || 'secondary',
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

async function upsertResultUpload({ class: cls, subject, session, term, students, status, branch }) {
    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    const normBranch = branch || 'secondary';
    const normalized = normalizeStudents(students);

    if (dbConnected) {
        const existing = await ResultUpload.findOne({
            class: cls,
            subject,
            branch: normBranch,
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
            branch: normBranch,
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
        r.class === cls && r.subject === subject && r.branch === normBranch && r.session === normSession &&
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
        branch: normBranch,
        session: normSession,
        term: normTerm,
        status: status || 'pending_verification',
        students: normalized,
        createdAt: new Date()
    };
    mem.resultUploads.push(upload);
    return { created: true, upload };
}

async function getPendingResultUploads(filter = {}) {
    if (dbConnected) {
        const q = { status: 'pending_verification' };
        if (filter.branch) q.branch = filter.branch;
        return await ResultUpload.find(q).lean();
    }
    return mem.resultUploads.filter(r => r.status === 'pending_verification' && (!filter.branch || r.branch === filter.branch));
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

// ═════════════════════════════════════════════════════════════════════════
// Result Processing & Ranking System
// ═════════════════════════════════════════════════════════════════════════

// Grade scale: totalScore out of 100
function computeGrade(score) {
    if (score >= 75) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
}

// ── Create ResultBatch + StudentResult records (Upsert) ─────────────────
// Called when a teacher saves results. If a Pending batch already exists for
// the same class/subject/term/session, it replaces the student results
// instead of creating a duplicate. This prevents the duplicate-record bug.
async function createResultBatch({ class: cls, subject, session, term, students, uploadedBy, uploadedByName, branch }) {
    const normSession = session || '2025/2026';
    const normTerm = term || 'Second Term';
    const normBranch = branch || 'secondary';
    const now = new Date();

    if (dbConnected) {
        // ── Upsert: find existing Pending batch for this compound key ──
        let batch = await ResultBatch.findOne({
            class: cls, subject, branch: normBranch, session: normSession, term: normTerm, status: 'Pending'
        });

        if (batch) {
            // Already exists — delete old student results and replace
            await StudentResult.deleteMany({ batchId: batch._id });
            batch.uploadedBy = uploadedBy;
            batch.uploadedByName = uploadedByName;
            batch.updatedAt = now;
            await batch.save();
        } else {
            // No Pending batch — create a new one
            batch = await ResultBatch.create({
                class: cls, subject, branch: normBranch, session: normSession, term: normTerm,
                status: 'Pending', uploadedBy, uploadedByName, createdAt: now
            });
        }

        // Insert fresh student results linked to this batch
        const records = (students || []).map(s => {
            const ca1 = Number(s.ca1) || 0;
            const ca2 = Number(s.ca2) || 0;
            const exam = Number(s.exam) || 0;
            const totalScore = ca1 + ca2 + exam;
            return {
                batchId: batch._id,
                admissionNumber: s.admissionNumber,
                studentName: s.studentName || '',
                class: cls,
                branch: normBranch,
                session: normSession,
                term: normTerm,
                subject,
                ca1, ca2, exam,
                totalScore,
                grade: computeGrade(totalScore),
                status: 'Pending',
                uploadedBy, uploadedByName,
                createdAt: now
            };
        });

        if (records.length > 0) {
            await StudentResult.insertMany(records);
        }

        return { batch, replaced: !batch.isNew };
    }

    // ── In-memory fallback ──────────────────────────────────────────────
    let batch = mem.resultBatches.find(b =>
        b.class === cls && b.subject === subject && b.branch === normBranch &&
        b.session === normSession && b.term === normTerm && b.status === 'Pending'
    );

    if (batch) {
        // Replace existing — remove old student results
        mem.studentResults = mem.studentResults.filter(r => String(r.batchId) !== String(batch._id));
        batch.uploadedBy = uploadedBy;
        batch.uploadedByName = uploadedByName;
        batch.updatedAt = now;
    } else {
        batch = {
            _id: 'RB' + (mem.resultBatches.length + 1),
            class: cls, subject, branch: normBranch, session: normSession, term: normTerm,
            status: 'Pending', uploadedBy, uploadedByName, createdAt: now
        };
        mem.resultBatches.push(batch);
    }

    (students || []).forEach(s => {
        const ca1 = Number(s.ca1) || 0;
        const ca2 = Number(s.ca2) || 0;
        const exam = Number(s.exam) || 0;
        const totalScore = ca1 + ca2 + exam;
        mem.studentResults.push({
            _id: 'SR' + (mem.studentResults.length + 1),
            batchId: batch._id,
            admissionNumber: s.admissionNumber,
            studentName: s.studentName || '',
            class: cls, branch: normBranch, session: normSession, term: normTerm, subject,
            ca1, ca2, exam, totalScore,
            grade: computeGrade(totalScore),
            status: 'Pending', uploadedBy, uploadedByName, createdAt: now
        });
    });

    return { batch, replaced: !!batch.updatedAt };
}

// ── Get pending batches ─────────────────────────────────────────────────
async function getPendingResultBatches(filter = {}) {
    if (dbConnected) {
        const q = { status: 'Pending' };
        if (filter.branch) q.branch = filter.branch;
        return await ResultBatch.find(q).sort({ createdAt: -1 }).lean();
    }
    return mem.resultBatches.filter(b => b.status === 'Pending' && (!filter.branch || b.branch === filter.branch));
}

// ── Get a single batch with its student results ────────────────────────
async function getResultBatchWithStudents(batchId) {
    if (dbConnected) {
        const batch = await ResultBatch.findById(batchId).lean();
        if (!batch) return null;
        const results = await StudentResult.find({ batchId }).lean();
        return { batch, results };
    }
    const batch = mem.resultBatches.find(b => String(b._id) === String(batchId));
    if (!batch) return null;
    const results = mem.studentResults.filter(r => String(r.batchId) === String(batchId));
    return { batch, results };
}

// ── Get all batches (teacher's uploaded results) ────────────────────────
async function getTeacherResultBatches(uploadedBy, filter = {}) {
    if (dbConnected) {
        const q = { uploadedBy };
        if (filter.branch) q.branch = filter.branch;
        return await ResultBatch.find(q).sort({ createdAt: -1 }).lean();
    }
    return mem.resultBatches.filter(b => b.uploadedBy === uploadedBy && (!filter.branch || b.branch === filter.branch));
}

// ── Approve batch + trigger ranking engine ──────────────────────────────
// 1. Mark batch as Approved
// 2. Mark all StudentResult records in that batch as Approved
// 3. Recalculate averageScore + position for ALL students in that class/term/session
async function approveResultBatch(batchId) {
    if (dbConnected) {
        const batch = await ResultBatch.findById(batchId);
        if (!batch) return null;

        // 1. Approve the batch
        batch.status = 'Approved';
        batch.approvedAt = new Date();
        await batch.save();

        // 2. Approve all StudentResult records in this batch
        await StudentResult.updateMany(
            { batchId, status: 'Pending' },
            { $set: { status: 'Approved', approvedAt: new Date() } }
        );

        // 3. Run ranking engine for this class/term/session
        await computeRankings(batch.class, batch.session, batch.term);

        return batch;
    }

    // In-memory fallback
    const batch = mem.resultBatches.find(b => String(b._id) === String(batchId));
    if (!batch) return null;
    batch.status = 'Approved';
    batch.approvedAt = new Date();

    mem.studentResults.forEach(r => {
        if (String(r.batchId) === String(batchId) && r.status === 'Pending') {
            r.status = 'Approved';
            r.approvedAt = new Date();
        }
    });

    computeRankingsInMemory(batch.class, batch.session, batch.term);
    return batch;
}

// ── Ranking Engine (MongoDB) ────────────────────────────────────────────
// For all APPROVED results in a class/term/session:
// 1. Group by admissionNumber → compute averageScore (total / subjects)
// 2. Sort by averageScore descending → assign position
// 3. Update all StudentResult records with averageScore, position, totalSubjectsTaken
async function computeRankings(cls, session, term) {
    // Fetch all approved results for this class/term/session
    const results = await StudentResult.find({
        class: cls, session, term, status: 'Approved'
    }).lean();

    if (results.length === 0) return;

    // Group by admissionNumber
    const studentMap = {};
    results.forEach(r => {
        if (!studentMap[r.admissionNumber]) {
            studentMap[r.admissionNumber] = {
                admissionNumber: r.admissionNumber,
                studentName: r.studentName || '',
                totalScore: 0,
                subjectCount: 0
            };
        }
        studentMap[r.admissionNumber].totalScore += r.totalScore;
        studentMap[r.admissionNumber].subjectCount += 1;
    });

    // Compute average and sort
    const ranked = Object.values(studentMap).map(s => ({
        ...s,
        averageScore: s.subjectCount > 0 ? parseFloat((s.totalScore / s.subjectCount).toFixed(2)) : 0
    }));
    ranked.sort((a, b) => b.averageScore - a.averageScore);

    // Assign positions (handle ties)
    let pos = 1;
    for (let i = 0; i < ranked.length; i++) {
        if (i > 0 && ranked[i].averageScore < ranked[i - 1].averageScore) {
            pos = i + 1;
        }
        ranked[i].position = pos;
    }

    // Batch update all StudentResult records
    const bulkOps = ranked.map(s => ({
        updateMany: {
            filter: {
                class: cls, session, term, admissionNumber: s.admissionNumber, status: 'Approved'
            },
            update: {
                $set: {
                    averageScore: s.averageScore,
                    position: s.position,
                    totalSubjectsTaken: s.subjectCount
                }
            }
        }
    }));

    if (bulkOps.length > 0) {
        await StudentResult.bulkWrite(bulkOps);
    }
}

// ── Ranking Engine (In-Memory fallback) ─────────────────────────────────
function computeRankingsInMemory(cls, session, term) {
    const results = mem.studentResults.filter(r =>
        r.class === cls && r.session === session && r.term === term && r.status === 'Approved'
    );
    if (results.length === 0) return;

    const studentMap = {};
    results.forEach(r => {
        if (!studentMap[r.admissionNumber]) {
            studentMap[r.admissionNumber] = {
                admissionNumber: r.admissionNumber,
                studentName: r.studentName || '',
                totalScore: 0,
                subjectCount: 0
            };
        }
        studentMap[r.admissionNumber].totalScore += r.totalScore;
        studentMap[r.admissionNumber].subjectCount += 1;
    });

    const ranked = Object.values(studentMap).map(s => ({
        ...s,
        averageScore: s.subjectCount > 0 ? parseFloat((s.totalScore / s.subjectCount).toFixed(2)) : 0
    }));
    ranked.sort((a, b) => b.averageScore - a.averageScore);

    let pos = 1;
    for (let i = 0; i < ranked.length; i++) {
        if (i > 0 && ranked[i].averageScore < ranked[i - 1].averageScore) {
            pos = i + 1;
        }
        ranked[i].position = pos;
    }

    // Update all matching records in memory
    ranked.forEach(s => {
        mem.studentResults.forEach(r => {
            if (r.admissionNumber === s.admissionNumber && r.class === cls &&
                r.session === session && r.term === term && r.status === 'Approved') {
                r.averageScore = s.averageScore;
                r.position = s.position;
                r.totalSubjectsTaken = s.subjectCount;
            }
        });
    });
}

// ── Get approved results for a student ──────────────────────────────────
async function getStudentApprovedResults(admissionNumber, session, term) {
    if (dbConnected) {
        return await StudentResult.find({
            admissionNumber, session, term, status: 'Approved'
        }).sort({ subject: 1 }).lean();
    }
    return mem.studentResults.filter(r =>
        r.admissionNumber === admissionNumber &&
        r.session === session && r.term === term && r.status === 'Approved'
    );
}

// ── Get all pending StudentResult records (for admin dashboard) ─────────
async function getAllPendingStudentResults() {
    if (dbConnected) {
        return await StudentResult.find({ status: 'Pending' }).sort({ createdAt: -1 }).lean();
    }
    return mem.studentResults.filter(r => r.status === 'Pending');
}

// ── Get summary stats for a student's approved results ──────────────────
async function getStudentResultSummary(admissionNumber, session, term) {
    const results = await getStudentApprovedResults(admissionNumber, session, term);
    if (results.length === 0) {
        return { results: [], summary: { totalScore: 0, average: 0, position: 0, totalSubjects: 0, classRank: '' } };
    }

    const firstResult = results[0];
    const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const average = results.length > 0 ? parseFloat((totalScore / results.length).toFixed(2)) : 0;
    const position = firstResult.position || 0;
    const totalSubjects = firstResult.totalSubjectsTaken || results.length;

    return {
        results: results.map(r => ({
            subject: r.subject,
            ca1: r.ca1,
            ca2: r.ca2,
            exam: r.exam,
            totalScore: r.totalScore,
            grade: r.grade,
            remark: r.remark || ''
        })),
        summary: {
            totalScore,
            average,
            position,
            totalSubjects,
            classRank: position > 0 ? `${position}${getOrdinalSuffix(position)} Position` : 'N/A'
        }
    };
}

function getOrdinalSuffix(n) {
    if (n <= 0) return '';
    if (n % 100 >= 11 && n % 100 <= 13) return 'th';
    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

module.exports = {
    setDbConnected,
    isDbConnected,
    seedIfEmpty,
    getStudents,
    getAllStudents,
    updateStudent,
    deleteStudent,
    createStudent,
    createTeacher,
    findUserByIdentifier,
    findUserById,
    getStudentByAdmission,
    getTeachers,
    getAllTeachers,
    updateTeacher,
    deleteTeacher,
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
    deleteAssignment,
    createResultBatch,
    getPendingResultBatches,
    getResultBatchWithStudents,
    getTeacherResultBatches,
    approveResultBatch,
    getStudentApprovedResults,
    getAllPendingStudentResults,
    getStudentResultSummary
};
