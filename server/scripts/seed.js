require('dotenv').config();
const mongoose = require('mongoose');
const { SkillArea, SubSkill } = require('../models/Skill');
const Class = require('../models/Class');
const AcademicYear = require('../models/AcademicYear');
const AcademicTerm = require('../models/AcademicTerm');

const SKILL_TAXONOMY = [
  { name: 'Reading', order: 1, color: '#3b82f6', subSkills: ['Fluency', 'Pronunciation', 'Comprehension', 'Vocabulary', 'Reading Speed'] },
  { name: 'Writing', order: 2, color: '#8b5cf6', subSkills: ['Handwriting', 'Spelling', 'Grammar', 'Creative Writing', 'Composition'] },
  { name: 'Speaking & Communication', order: 3, color: '#ec4899', subSkills: ['Clarity', 'Confidence', 'Elocution', 'Debate', 'Storytelling'] },
  { name: 'Listening', order: 4, color: '#f59e0b', subSkills: ['Following Instructions', 'Note-Taking', 'Recall'] },
  { name: 'Numeracy & Logical Thinking', order: 5, color: '#10b981', subSkills: ['Mental Mathematics', 'Problem-Solving', 'Puzzles', 'Reasoning'] },
  { name: 'Digital / Computer Skills', order: 6, color: '#06b6d4', subSkills: ['Typing', 'Office Tools', 'Basic Coding', 'Internet Safety'] },
  { name: 'Arts & Crafts', order: 7, color: '#f97316', subSkills: ['Drawing', 'Painting', 'Clay Work', 'Craft', 'Rangoli'] },
  { name: 'Music & Dance', order: 8, color: '#a855f7', subSkills: ['Vocal Skills', 'Instruments', 'Classical Dance', 'Folk Dance'] },
  { name: 'Sports & Physical Skills', order: 9, color: '#22c55e', subSkills: ['Athletics', 'Team Games', 'Yoga', 'Fitness'] },
  { name: 'Life Skills & Leadership', order: 10, color: '#ef4444', subSkills: ['Leadership', 'Teamwork', 'Time Management', 'Empathy', 'Discipline'] },
];

const CLASSES = [
  { name: 'Pre-KG', shortName: 'PKG', classGroup: 'Pre-KG–2', order: 1 },
  { name: 'KG', shortName: 'KG', classGroup: 'Pre-KG–2', order: 2 },
  { name: 'Class 1', shortName: 'C1', classGroup: 'Pre-KG–2', order: 3 },
  { name: 'Class 2', shortName: 'C2', classGroup: 'Pre-KG–2', order: 4 },
  { name: 'Class 3', shortName: 'C3', classGroup: 'Classes 3–5', order: 5 },
  { name: 'Class 4', shortName: 'C4', classGroup: 'Classes 3–5', order: 6 },
  { name: 'Class 5', shortName: 'C5', classGroup: 'Classes 3–5', order: 7 },
  { name: 'Class 6', shortName: 'C6', classGroup: 'Classes 6–8', order: 8 },
  { name: 'Class 7', shortName: 'C7', classGroup: 'Classes 6–8', order: 9 },
  { name: 'Class 8', shortName: 'C8', classGroup: 'Classes 6–8', order: 10 },
  { name: 'Class 9', shortName: 'C9', classGroup: 'Classes 9–12', order: 11 },
  { name: 'Class 10', shortName: 'C10', classGroup: 'Classes 9–12', order: 12 },
  { name: 'Class 11', shortName: 'C11', classGroup: 'Classes 9–12', order: 13 },
  { name: 'Class 12', shortName: 'C12', classGroup: 'Classes 9–12', order: 14 },
];

const DEFAULT_LEVEL_DESCRIPTIONS = [
  { level: 1, label: 'Beginner', description: 'Needs regular support' },
  { level: 2, label: 'Developing', description: 'Can perform with some guidance' },
  { level: 3, label: 'Proficient', description: 'Can perform independently' },
  { level: 4, label: 'Advanced', description: 'Can demonstrate the skill or guide others' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Seed skill areas and sub-skills
  for (const area of SKILL_TAXONOMY) {
    const existing = await SkillArea.findOne({ name: area.name });
    let skillArea = existing;
    if (!existing) {
      skillArea = await SkillArea.create({ name: area.name, order: area.order, color: area.color });
      console.log(`Created skill area: ${area.name}`);
    }
    for (let i = 0; i < area.subSkills.length; i++) {
      const subName = area.subSkills[i];
      const existingSub = await SubSkill.findOne({ skillArea: skillArea._id, name: subName });
      if (!existingSub) {
        await SubSkill.create({
          skillArea: skillArea._id, name: subName, order: i + 1,
          levelDescriptions: DEFAULT_LEVEL_DESCRIPTIONS,
        });
        console.log(`  Created sub-skill: ${subName}`);
      }
    }
  }

  // Seed classes with default sections A, B, C
  for (const cls of CLASSES) {
    const existing = await Class.findOne({ name: cls.name });
    if (!existing) {
      await Class.create({
        ...cls,
        sections: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      });
      console.log(`Created class: ${cls.name}`);
    }
  }

  // Seed current academic year
  const currentYear = await AcademicYear.findOne({ isCurrent: true });
  if (!currentYear) {
    const year = await AcademicYear.create({
      label: '2024-25',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-03-31'),
      isCurrent: true,
    });
    console.log('Created academic year: 2024-25');
    // Create 3 terms
    const terms = [
      { name: 'Term 1', termNumber: 1, startDate: new Date('2024-06-01'), endDate: new Date('2024-09-30') },
      { name: 'Term 2', termNumber: 2, startDate: new Date('2024-10-01'), endDate: new Date('2024-12-31') },
      { name: 'Term 3', termNumber: 3, startDate: new Date('2025-01-01'), endDate: new Date('2025-03-31') },
    ];
    for (const t of terms) {
      await AcademicTerm.create({ ...t, academicYear: year._id });
      console.log(`Created term: ${t.name}`);
    }
  }

  console.log('Seed complete');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
