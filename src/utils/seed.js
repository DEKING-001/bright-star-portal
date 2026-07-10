// Seed Script - Create demo data for the portal
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Announcement = require('../models/Announcement');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bright_star_portal';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Announcement.deleteMany({});
        await Result.deleteMany({});
        await Fee.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing data');
        
        // Create Admin
        const admin = await User.create({
            email: 'admin@brightstar.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
        });
        console.log('Admin created');
        
        // Create Teachers
        const teachers = await User.create([
            {
                email: 'john.owens@brightstar.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Owens',
                role: 'teacher',
                staffId: 'TCH/001'
            },
            {
                email: 'sarah.adesanya@brightstar.com',
                password: 'password123',
                firstName: 'Sarah',
                lastName: 'Adesanya',
                role: 'teacher',
                staffId: 'TCH/002'
            },
            {
                email: 'michael.ugbo@brightstar.com',
                password: 'password123',
                firstName: 'Michael',
                lastName: 'Ugbo',
                role: 'teacher',
                staffId: 'TCH/003'
            }
        ]);
        console.log('Teachers created');
        
        // Create teacher profiles
        await Teacher.create([
            { user: teachers[0]._id, staffId: 'TCH/001', department: 'Science', subjects: ['Mathematics', 'Further Mathematics'], qualification: 'M.Sc Mathematics', experience: 10 },
            { user: teachers[1]._id, staffId: 'TCH/002', department: 'Languages', subjects: ['English Language', 'Literature'], qualification: 'M.A English', experience: 8 },
            { user: teachers[2]._id, staffId: 'TCH/003', department: 'Science', subjects: ['Physics', 'Chemistry'], qualification: 'M.Sc Physics', experience: 12 }
        ]);
        console.log('Teacher profiles created');
        
        // Create Students
        const studentUsers = await User.create([
            { email: 'chukwuemeka@student.com', password: 'password123', firstName: 'Chukwuemeka', lastName: 'Okonkwo', role: 'student', admissionNumber: 'BSS/2026/001' },
            { email: 'amina@student.com', password: 'password123', firstName: 'Amina', lastName: 'Ibrahim', role: 'student', admissionNumber: 'BSS/2026/002' },
            { email: 'david@student.com', password: 'password123', firstName: 'David', lastName: 'Adeyemi', role: 'student', admissionNumber: 'BSS/2026/003' },
            { email: 'fatima@student.com', password: 'password123', firstName: 'Fatima', lastName: 'Mohammed', role: 'student', admissionNumber: 'BSS/2026/004' },
            { email: 'emmanuel@student.com', password: 'password123', firstName: 'Emmanuel', lastName: 'Okoro', role: 'student', admissionNumber: 'BSS/2026/005' }
        ]);
        console.log('Students created');
        
        // Create student profiles
        const students = await Student.create([
            { user: studentUsers[0]._id, admissionNumber: 'BSS/2026/001', class: 'SS1', classArm: 'A', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mr. Okonkwo', parentPhone: '+234 801 234 5678' },
            { user: studentUsers[1]._id, admissionNumber: 'BSS/2026/002', class: 'SS1', classArm: 'A', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Mr. Ibrahim', parentPhone: '+234 802 345 6789' },
            { user: studentUsers[2]._id, admissionNumber: 'BSS/2026/003', class: 'SS1', classArm: 'B', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Mrs. Adeyemi', parentPhone: '+234 803 456 7890' },
            { user: studentUsers[3]._id, admissionNumber: 'BSS/2026/004', class: 'SS2', classArm: 'A', session: '2025/2026', term: 'Second Term', gender: 'Female', parentName: 'Alhaji Mohammed', parentPhone: '+234 804 567 8901' },
            { user: studentUsers[4]._id, admissionNumber: 'BSS/2026/005', class: 'SS2', classArm: 'A', session: '2025/2026', term: 'Second Term', gender: 'Male', parentName: 'Dr. Okoro', parentPhone: '+234 805 678 9012' }
        ]);
        console.log('Student profiles created');
        
        // Create Announcements
        await Announcement.create([
            {
                title: 'Second Term Examinations',
                content: 'Second term examinations will commence from July 20th to August 1st, 2026. All students are advised to prepare adequately.',
                category: 'academic',
                targetAudience: 'all',
                postedBy: admin._id
            },
            {
                title: 'Inter-House Sports Competition',
                content: 'Annual inter-house sports competition will hold on July 15th, 2026. Students should come in their respective house uniforms.',
                category: 'sports',
                targetAudience: 'all',
                postedBy: admin._id
            },
            {
                title: 'Graduation Ceremony 2026',
                content: 'The graduation ceremony for the class of 2026 will hold on August 5th, 2026. All graduating students and their parents are expected to attend.',
                category: 'events',
                targetAudience: 'all',
                postedBy: admin._id
            }
        ]);
        console.log('Announcements created');
        
        // Create Results for first student
        const subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology'];
        for (const student of students.slice(0, 3)) {
            for (const subject of subjects) {
                await Result.create({
                    student: student._id,
                    admissionNumber: student.admissionNumber,
                    class: student.class,
                    session: '2025/2026',
                    term: 'Second Term',
                    subject,
                    ca1: Math.floor(Math.random() * 5) + 15,
                    ca2: Math.floor(Math.random() * 5) + 14,
                    exam: Math.floor(Math.random() * 15) + 40,
                    approved: true,
                    uploadedBy: teachers[0]._id
                });
            }
        }
        console.log('Results created');
        
        // Create Fee records
        for (const student of students) {
            await Fee.create({
                student: student._id,
                admissionNumber: student.admissionNumber,
                session: '2025/2026',
                term: 'Second Term',
                totalFee: 320000,
                amountPaid: Math.floor(Math.random() * 200000) + 100000,
                paymentHistory: [
                    { amount: 150000, method: 'bank_transfer', reference: 'TRF/2025/001' }
                ]
            });
        }
        console.log('Fee records created');
        
        // Create Attendance records
        const dates = ['2026-07-07', '2026-07-04', '2026-07-03', '2026-07-02', '2026-07-01'];
        const statuses = ['present', 'present', 'late', 'present', 'absent'];
        
        for (const student of students) {
            for (let i = 0; i < dates.length; i++) {
                await Attendance.create({
                    student: student._id,
                    admissionNumber: student.admissionNumber,
                    class: student.class,
                    date: new Date(dates[i]),
                    status: statuses[i],
                    session: '2025/2026',
                    term: 'Second Term'
                });
            }
        }
        console.log('Attendance records created');
        
        console.log('\n--- Demo Credentials ---');
        console.log('Admin: admin@brightstar.com / admin123');
        console.log('Teacher: TCH/001 / password123');
        console.log('Student: BSS/2026/001 / password123');
        console.log('------------------------\n');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
