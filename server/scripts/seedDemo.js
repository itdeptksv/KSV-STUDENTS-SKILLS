/**
 * seedDemo.js — Creates demo users and sample data for development/testing.
 * Safe to run multiple times: skips existing records.
 * All demo records are tagged with isDemo:true where the schema allows,
 * and use clearly identifiable names/emails.
 *
 * Usage: node scripts/seedDemo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const AcademicTerm = require('../models/AcademicTerm');
const { SkillArea, SubSkill } = require('../models/Skill');
const SkillAssessment = require('../models/SkillAssessment');
const Competition = require('../models/Competition');
const { CompetitionRegistration } = require('../models/CompetitionResult');
const { ParentStudentLink } = require('../models/Misc');

// ── Demo credentials (development only) ──────────────────────────────────────
const DEMO_USERS = [
  { name: 'Demo Admin',         email: 'admin@demo.ksv',         password: 'Demo@1234', role: 'admin' },
  { name: 'Demo Class Teacher', email: 'classteacher@demo.ksv',  password: 'Demo@1234', role: 'class_teacher' },
  { name: 'Demo Skill Teacher', email: 'skillteacher@demo.ksv',  password: 'Demo@1234', role: 'skill_teacher' },
  { name: 'Demo Student',       email: 'student@demo.ksv',       password: 'Demo@1234', role: 'student' },
  { name: 'Demo Parent',        email: 'parent@demo.ksv',        password: 'Demo@1234', role: 'parent' },
];

async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) { console.log(`  skip user: ${data.email}`); return existing; }
  const u = await User.create(data);
  console.log(`  created user: ${data.email} (${data.role})`);
  return u;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Demo users
  console.log('\n── Demo Users ──');
  const users = {};
  for (const d of DEMO_USERS) {
    users[d.role] = await upsertUser(d);
  }

  // 2. Resolve academic year + term
  const year = await AcademicYear.findOne({ isCurrent: true });
  if (!year) { console.error('Run npm run seed first to create academic year'); process.exit(1); }
  const term = await AcademicTerm.findOne({ academicYear: year._id, termNumber: 1 });
  if (!term) { console.error('No term found — run npm run seed first'); process.exit(1); }

  // 3. Resolve a class (Class 5 Section A)
  const cls = await Class.findOne({ name: 'Class 5' });
  if (!cls) { console.error('No classes found — run npm run seed first'); process.exit(1); }

  // 4. Assign class_teacher to Class 5
  await User.findByIdAndUpdate(users.class_teacher._id, {
    $addToSet: { assignedClasses: cls._id },
  });

  // 5. Demo student record
  console.log('\n── Demo Student Record ──');
  let demoStudent = await Student.findOne({ admissionNumber: 'DEMO-001' });
  if (!demoStudent) {
    demoStudent = await Student.create({
      name: 'Demo Student',
      admissionNumber: 'DEMO-001',
      class: cls._id,
      section: 'A',
      academicYear: year._id,
      gender: 'male',
      userAccount: users.student._id,
      createdBy: users.admin._id,
    });
    console.log('  created demo student: DEMO-001');
  } else {
    console.log('  skip student: DEMO-001');
  }

  // Link student user → student record
  await User.findByIdAndUpdate(users.student._id, { studentRef: demoStudent._id });

  // 6. Parent-student link
  console.log('\n── Parent Link ──');
  const existingLink = await ParentStudentLink.findOne({
    parent: users.parent._id, student: demoStudent._id,
  });
  if (!existingLink) {
    await ParentStudentLink.create({
      parent: users.parent._id,
      student: demoStudent._id,
      relation: 'Father',
      verifiedBy: users.admin._id,
      isActive: true,
    });
    console.log('  linked parent → demo student');
  } else {
    console.log('  skip parent link (exists)');
  }

  // 7. Sample assessments (approved) for demo student
  console.log('\n── Demo Assessments ──');
  const skillAreas = await SkillArea.find({ isActive: true }).limit(4);
  for (const area of skillAreas) {
    const subSkills = await SubSkill.find({ skillArea: area._id }).limit(2);
    for (const sub of subSkills) {
      const exists = await SkillAssessment.findOne({
        student: demoStudent._id, subSkill: sub._id, term: term._id,
      });
      if (!exists) {
        await SkillAssessment.create({
          student: demoStudent._id,
          class: cls._id,
          section: 'A',
          skillArea: area._id,
          subSkill: sub._id,
          academicYear: year._id,
          term: term._id,
          assessmentDate: new Date(),
          level: Math.ceil(Math.random() * 4),
          status: 'approved',
          remarks: '[Demo] Sample assessment record',
          createdBy: users.class_teacher._id,
          reviewedBy: users.admin._id,
          reviewedAt: new Date(),
        });
        console.log(`  created assessment: ${area.name} / ${sub.name}`);
      } else {
        console.log(`  skip assessment: ${area.name} / ${sub.name}`);
      }
    }
  }

  // 8. Sample competition
  console.log('\n── Demo Competition ──');
  let comp = await Competition.findOne({ title: '[Demo] Annual Skill Showcase' });
  if (!comp) {
    comp = await Competition.create({
      title: '[Demo] Annual Skill Showcase',
      description: 'Demonstration competition for testing the KSV Skill Sets portal.',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'open',
      level: 'school',
      format: 'individual',
      academicYear: year._id,
      createdBy: users.admin._id,
    });
    console.log('  created demo competition');
  } else {
    console.log('  skip competition (exists)');
  }

  // Register demo student in competition
  const existingReg = await CompetitionRegistration.findOne({
    competition: comp._id, student: demoStudent._id,
  });
  if (!existingReg) {
    await CompetitionRegistration.create({
      competition: comp._id,
      student: demoStudent._id,
      registeredBy: users.class_teacher._id,
      status: 'registered',
    });
    console.log('  registered demo student in competition');
  } else {
    console.log('  skip competition registration (exists)');
  }

  console.log('\n✅ Demo seed complete');
  console.log('\nDemo credentials:');
  for (const d of DEMO_USERS) {
    console.log(`  ${d.role.padEnd(15)} ${d.email.padEnd(30)} ${d.password}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
