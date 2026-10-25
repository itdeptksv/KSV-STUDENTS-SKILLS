/**
 * skillsTaxonomy.js — Master Configuration for the 12 Skill Areas and Sub-Skills
 * Kanchiskillsets.in — Student Skills Development Application
 *
 * EXACT ORDER:
 * 1. Academic
 * 2. Language Skills
 * 3. Thinking
 * 4. Social and Emotional
 * 5. Life Skills
 * 6. Digital
 * 7. Values
 * 8. Health
 * 9. Sports
 * 10. Extracurricular
 * 11. Creative
 * 12. Vocational
 */

export const SKILL_AREAS_CONFIG = [
  {
    _id: 'area_1',
    slug: 'academic',
    name: 'Academic',
    order: 1,
    icon: 'GraduationCap',
    emoji: '📚',
    color: '#2563eb', // Blue
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Foundational classroom scholastic learning, numeracy, and scientific enquiry.',
    subSkills: [
      { _id: 'sub_1', slug: 'communication', name: 'Communication', order: 1 },
      { _id: 'sub_2', slug: 'numeracy', name: 'Numeracy', order: 2 },
      { _id: 'sub_3', slug: 'scientific-thinking', name: 'Scientific Thinking', order: 3 },
    ],
  },
  {
    _id: 'area_2',
    slug: 'language-skills',
    name: 'Language Skills',
    order: 2,
    icon: 'Languages',
    emoji: '🗣️',
    color: '#8b5cf6', // Violet
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Core linguistic competencies: listening, speaking, reading fluency, and writing skills.',
    subSkills: [
      { _id: 'sub_4', slug: 'listening', name: 'Listening', order: 1 },
      { _id: 'sub_5', slug: 'speaking', name: 'Speaking', order: 2 },
      { _id: 'sub_6', slug: 'reading', name: 'Reading', order: 3 },
      { _id: 'sub_7', slug: 'writing-skills', name: 'Writing Skills', order: 4 },
    ],
  },
  {
    _id: 'area_3',
    slug: 'thinking',
    name: 'Thinking',
    order: 3,
    icon: 'Brain',
    emoji: '💡',
    color: '#06b6d4', // Cyan
    bgColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'Cognitive reasoning, critical inquiry, creative problem solving, and analytical decision making.',
    subSkills: [
      { _id: 'sub_8', slug: 'critical-thinking', name: 'Critical Thinking', order: 1 },
      { _id: 'sub_9', slug: 'creativity', name: 'Creativity', order: 2 },
      { _id: 'sub_10', slug: 'problem-solving', name: 'Problem Solving', order: 3 },
      { _id: 'sub_11', slug: 'decision-making', name: 'Decision Making', order: 4 },
      { _id: 'sub_12', slug: 'reasoning', name: 'Reasoning', order: 5 },
    ],
  },
  {
    _id: 'area_4',
    slug: 'social-and-emotional',
    name: 'Social and Emotional',
    order: 4,
    icon: 'HeartHandshake',
    emoji: '🤝',
    color: '#ec4899', // Pink
    bgColor: 'bg-pink-50 text-pink-700 border-pink-200',
    description: 'Interpersonal relationships, peer empathy, collaborative teamwork, and self-confidence.',
    subSkills: [
      { _id: 'sub_13', slug: 'teamwork', name: 'Teamwork', order: 1 },
      { _id: 'sub_14', slug: 'empathy', name: 'Empathy', order: 2 },
      { _id: 'sub_15', slug: 'self-confidence', name: 'Self-Confidence', order: 3 },
    ],
  },
  {
    _id: 'area_5',
    slug: 'life-skills',
    name: 'Life Skills',
    order: 5,
    icon: 'Clock',
    emoji: '⏱️',
    color: '#f59e0b', // Amber
    bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Practical self-management, personal discipline, goal orientation, and financial literacy.',
    subSkills: [
      { _id: 'sub_16', slug: 'time-management', name: 'Time Management', order: 1 },
      { _id: 'sub_17', slug: 'self-discipline', name: 'Self-Discipline', order: 2 },
      { _id: 'sub_18', slug: 'goal-setting', name: 'Goal Setting', order: 3 },
      { _id: 'sub_19', slug: 'financial-literacy', name: 'Financial Literacy', order: 4 },
    ],
  },
  {
    _id: 'area_6',
    slug: 'digital',
    name: 'Digital',
    order: 6,
    icon: 'Monitor',
    emoji: '💻',
    color: '#0284c7', // Sky Blue
    bgColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Technology awareness, cyber safety, digital information literacy, and foundational coding.',
    subSkills: [
      { _id: 'sub_20', slug: 'computer-literacy', name: 'Computer Literacy', order: 1 },
      { _id: 'sub_21', slug: 'cyber-safety', name: 'Cyber Safety', order: 2 },
      { _id: 'sub_22', slug: 'information-literacy', name: 'Information Literacy', order: 3 },
      { _id: 'sub_23', slug: 'coding', name: 'Coding', order: 4 },
    ],
  },
  {
    _id: 'area_7',
    slug: 'values',
    name: 'Values',
    order: 7,
    icon: 'ShieldCheck',
    emoji: '🕊️',
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Ethical behavior, respect for others, environmental stewardship, and civic responsibility.',
    subSkills: [
      { _id: 'sub_24', slug: 'honesty', name: 'Honesty', order: 1 },
      { _id: 'sub_25', slug: 'respect', name: 'Respect', order: 2 },
      { _id: 'sub_26', slug: 'environmental-care', name: 'Environmental Care', order: 3 },
      { _id: 'sub_27', slug: 'civic-sense', name: 'Civic Sense', order: 4 },
    ],
  },
  {
    _id: 'area_8',
    slug: 'health',
    name: 'Health',
    order: 8,
    icon: 'HeartPulse',
    emoji: '🍎',
    color: '#ef4444', // Red
    bgColor: 'bg-red-50 text-red-700 border-red-200',
    description: 'Physical health, personal hygiene, wholesome nutrition, basic first aid, and mental well-being.',
    subSkills: [
      { _id: 'sub_28', slug: 'hygiene', name: 'Hygiene', order: 1 },
      { _id: 'sub_29', slug: 'nutrition', name: 'Nutrition', order: 2 },
      { _id: 'sub_30', slug: 'first-aid', name: 'First Aid', order: 3 },
      { _id: 'sub_31', slug: 'well-being', name: 'Well-Being', order: 4 },
    ],
  },
  {
    _id: 'area_9',
    slug: 'sports',
    name: 'Sports',
    order: 9,
    icon: 'Trophy',
    emoji: '⚽',
    color: '#ea580c', // Orange
    bgColor: 'bg-orange-50 text-orange-700 border-orange-200',
    description: 'Motor coordination, athletics, team games, yoga, self-defence, and fair play sportsmanship.',
    subSkills: [
      { _id: 'sub_32', slug: 'coordination', name: 'Coordination', order: 1 },
      { _id: 'sub_33', slug: 'team-games', name: 'Team Games', order: 2 },
      { _id: 'sub_34', slug: 'athletics', name: 'Athletics', order: 3 },
      { _id: 'sub_35', slug: 'yoga', name: 'Yoga', order: 4 },
      { _id: 'sub_36', slug: 'self-defence', name: 'Self-Defence', order: 5 },
      { _id: 'sub_37', slug: 'sportsmanship', name: 'Sportsmanship', order: 6 },
    ],
  },
  {
    _id: 'area_10',
    slug: 'extracurricular',
    name: 'Extracurricular',
    order: 10,
    icon: 'Sparkles',
    emoji: '🎭',
    color: '#9333ea', // Purple
    bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Performing arts, creative expression, debates, quizzes, leadership clubs, and youth organizations.',
    subSkills: [
      { _id: 'sub_38', slug: 'music', name: 'Music', order: 1 },
      { _id: 'sub_39', slug: 'dance', name: 'Dance', order: 2 },
      { _id: 'sub_40', slug: 'drama', name: 'Drama', order: 3 },
      { _id: 'sub_41', slug: 'art-and-craft', name: 'Art and Craft', order: 4 },
      { _id: 'sub_42', slug: 'debate', name: 'Debate', order: 5 },
      { _id: 'sub_43', slug: 'elocution', name: 'Elocution', order: 6 },
      { _id: 'sub_44', slug: 'quiz', name: 'Quiz', order: 7 },
      { _id: 'sub_45', slug: 'clubs', name: 'Clubs', order: 8 },
      { _id: 'sub_46', slug: 'ncc-nss-scouts', name: 'NCC/NSS/Scouts', order: 9 },
      { _id: 'sub_47', slug: 'event-management', name: 'Event Management', order: 10 },
    ],
  },
  {
    _id: 'area_11',
    slug: 'creative',
    name: 'Creative',
    order: 11,
    icon: 'Palette',
    emoji: '🎨',
    color: '#d946ef', // Fuchsia
    bgColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    description: 'Artistic imagination, design aesthetics, originality, and rich cultural appreciation.',
    subSkills: [
      { _id: 'sub_48', slug: 'imagination', name: 'Imagination', order: 1 },
      { _id: 'sub_49', slug: 'cultural-appreciation', name: 'Cultural Appreciation', order: 2 },
    ],
  },
  {
    _id: 'area_12',
    slug: 'vocational',
    name: 'Vocational',
    order: 12,
    icon: 'Wrench',
    emoji: '🛠️',
    color: '#14b8a6', // Teal
    bgColor: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Hands-on practical skills: gardening, culinary skills, handicrafts, and entrepreneurship.',
    subSkills: [
      { _id: 'sub_50', slug: 'gardening', name: 'Gardening', order: 1 },
      { _id: 'sub_51', slug: 'cooking', name: 'Cooking', order: 2 },
      { _id: 'sub_52', slug: 'handicrafts', name: 'Handicrafts', order: 3 },
      { _id: 'sub_53', slug: 'entrepreneurship-skills', name: 'Entrepreneurship Skills', order: 4 },
    ],
  },
];

/**
 * Flat list of all sub-skills with skillArea reference
 */
export const ALL_SUB_SKILLS_CONFIG = SKILL_AREAS_CONFIG.flatMap((area) =>
  area.subSkills.map((sub) => ({
    ...sub,
    skillArea: area._id,
    skillAreaName: area.name,
    isActive: true,
  }))
);

/**
 * Helper to find area by ID or slug
 */
export function findSkillArea(idOrSlug) {
  if (!idOrSlug) return null;
  return SKILL_AREAS_CONFIG.find(
    (a) => a._id === idOrSlug || a.slug === idOrSlug || a.name.toLowerCase() === idOrSlug.toLowerCase()
  ) || null;
}

/**
 * Helper to find sub-skill by ID or slug
 */
export function findSubSkill(subIdOrSlug, areaId = null) {
  if (!subIdOrSlug) return null;
  const list = areaId
    ? ALL_SUB_SKILLS_CONFIG.filter((s) => s.skillArea === areaId)
    : ALL_SUB_SKILLS_CONFIG;

  return list.find(
    (s) => s._id === subIdOrSlug || s.slug === subIdOrSlug || s.name.toLowerCase() === subIdOrSlug.toLowerCase()
  ) || null;
}
