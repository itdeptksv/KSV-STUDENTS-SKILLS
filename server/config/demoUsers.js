/**
 * Demo accounts for local-only / demo mode.
 * Matches existing roles and seed scripts.
 */
const DEMO_USERS = [
  {
    _id: 'user_admin',
    name: 'Demo Admin',
    email: 'admin@demo.ksv',
    password: 'Demo@1234',
    role: 'admin',
    isActive: true,
    assignedClasses: [],
    assignedSkillAreas: [],
    assignedSubSkills: [],
  },
  {
    _id: 'user_class_teacher',
    name: 'Demo Class Teacher',
    email: 'classteacher@demo.ksv',
    password: 'Demo@1234',
    role: 'class_teacher',
    isActive: true,
    assignedClasses: ['class_5'],
    assignedSkillAreas: [],
    assignedSubSkills: [],
  },
  {
    _id: 'user_skill_teacher',
    name: 'Demo Skills Teacher',
    email: 'skillteacher@demo.ksv',
    password: 'Demo@1234',
    role: 'skill_teacher',
    isActive: true,
    assignedClasses: [],
    assignedSkillAreas: ['area_9'],
    assignedSubSkills: ['sub_33', 'sub_34', 'sub_35', 'sub_36'],
  },
];

module.exports = DEMO_USERS;
