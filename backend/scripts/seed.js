const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Complaint = require('../src/models/Complaint');
const SLA = require('../src/models/SLA');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const AuditLog = require('../src/models/AuditLog');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resolveit';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    await SLA.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Seed SLAs
    const slas = await SLA.insertMany([
      { priority: 'CRITICAL', resolutionHours: 8 },
      { priority: 'HIGH', resolutionHours: 24 },
      { priority: 'MEDIUM', resolutionHours: 48 },
      { priority: 'LOW', resolutionHours: 72 }
    ]);
    console.log('Seeded SLA configurations.');

    // 2. Seed Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@resolveit.com',
      password: 'Admin@123456',
      role: 'ADMIN',
      department: 'IT Operations',
      phone: '+1-555-0100'
    });

    const staffUser = await User.create({
      name: 'Support Engineer Alex',
      email: 'staff@resolveit.com',
      password: 'Staff@123456',
      role: 'STAFF',
      department: 'Campus Facilities',
      phone: '+1-555-0101'
    });

    const studentUser = await User.create({
      name: 'John Student',
      email: 'student@resolveit.com',
      password: 'Student@123456',
      role: 'USER',
      department: 'Computer Science',
      phone: '+1-555-0102'
    });

    console.log('Seeded Users: admin@resolveit.com, staff@resolveit.com, student@resolveit.com');

    // 3. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Infrastructure', description: 'Building, furniture, civil maintenance', icon: 'Building' },
      { name: 'Electrical', description: 'Power supply, lighting, AC, fans', icon: 'Zap' },
      { name: 'Internet/Network', description: 'Wi-Fi, LAN, Ethernet connectivity', icon: 'Wifi' },
      { name: 'Hostel', description: 'Dormitory, mess, room amenities', icon: 'Home' },
      { name: 'Classroom', description: 'Projector, smartboard, seating arrangement', icon: 'Tv' },
      { name: 'Library', description: 'Reading room, books issue, quiet zone', icon: 'BookOpen' },
      { name: 'Transport', description: 'Bus service, parking, shuttle service', icon: 'Bus' },
      { name: 'Maintenance', description: 'Plumbing, water coolers, sanitation', icon: 'Tool' },
      { name: 'Security', description: 'ID verification, CCTV, gate security', icon: 'Shield' },
      { name: 'Cleanliness', description: 'Waste disposal, washroom hygiene', icon: 'Trash2' },
      { name: 'Academic', description: 'Portal access, grading issues, schedule', icon: 'GraduationCap' },
      { name: 'Other', description: 'General complaints & inquiries', icon: 'HelpCircle' }
    ]);

    console.log(`Seeded ${categories.length} Complaint Categories.`);

    // 4. Seed Sample Complaints
    const netCategory = categories.find(c => c.name === 'Internet/Network');
    const elecCategory = categories.find(c => c.name === 'Electrical');
    const infraCategory = categories.find(c => c.name === 'Infrastructure');

    const deadline1 = new Date();
    deadline1.setHours(deadline1.getHours() + 24);

    const deadline2 = new Date();
    deadline2.setHours(deadline2.getHours() + 8);

    const complaint1 = await Complaint.create({
      complaintId: 'CMP-2026-0001',
      title: 'Wi-Fi Disconnections in Computer Science Block B',
      description: 'The Wi-Fi network frequently drops connection during lab hours, preventing access to development servers.',
      category: netCategory._id,
      subcategory: 'Wi-Fi Network',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdBy: studentUser._id,
      assignedStaff: staffUser._id,
      slaDeadline: deadline1,
      statusHistory: [
        { status: 'NEW', changedBy: studentUser._id, note: 'Complaint submitted' },
        { status: 'ASSIGNED', changedBy: adminUser._id, note: 'Assigned to Alex' },
        { status: 'IN_PROGRESS', changedBy: staffUser._id, note: 'Inspecting access point switches' }
      ]
    });

    const complaint2 = await Complaint.create({
      complaintId: 'CMP-2026-0002',
      title: 'Power Socket Sparking in Library Reading Room 3',
      description: 'The wall power socket near desk #14 produced a spark when plugging in laptop charger.',
      category: elecCategory._id,
      subcategory: 'Power Outlets',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      createdBy: studentUser._id,
      assignedStaff: staffUser._id,
      slaDeadline: deadline2,
      statusHistory: [
        { status: 'NEW', changedBy: studentUser._id, note: 'Complaint submitted' },
        { status: 'ASSIGNED', changedBy: adminUser._id, note: 'Assigned immediately due to electrical hazard' }
      ]
    });

    const complaint3 = await Complaint.create({
      complaintId: 'CMP-2026-0003',
      title: 'Broken Chair Armrest in Lecture Hall A2',
      description: 'Desk chair in row 4 seat 2 has a broken armrest with sharp wooden edge.',
      category: infraCategory._id,
      subcategory: 'Furniture',
      priority: 'LOW',
      status: 'RESOLVED',
      createdBy: studentUser._id,
      assignedStaff: staffUser._id,
      slaDeadline: new Date(Date.now() - 3600000),
      resolutionDate: new Date(),
      statusHistory: [
        { status: 'NEW', changedBy: studentUser._id, note: 'Complaint submitted' },
        { status: 'ASSIGNED', changedBy: adminUser._id, note: 'Assigned to carpentering staff' },
        { status: 'IN_PROGRESS', changedBy: staffUser._id, note: 'Replaced chair armrest' },
        { status: 'RESOLVED', changedBy: staffUser._id, note: 'Repair verified and completed' }
      ]
    });

    console.log('Seeded sample complaints CMP-2026-0001, CMP-2026-0002, CMP-2026-0003');

    // 5. Seed Comments & Notifications
    await Comment.create({
      complaint: complaint1._id,
      user: staffUser._id,
      text: 'Our network team is currently reconfiguring AP router #4 in Block B.',
      isInternal: false
    });

    await Notification.create({
      user: studentUser._id,
      title: 'Complaint In Progress',
      message: 'Your complaint CMP-2026-0001 is now IN_PROGRESS with Alex.',
      complaint: complaint1._id
    });

    console.log('Seeded initial comments and notifications.');

    console.log('\n========================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@resolveit.com   / Admin@123456');
    console.log('Staff:   staff@resolveit.com   / Staff@123456');
    console.log('Student: student@resolveit.com / Student@123456');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
