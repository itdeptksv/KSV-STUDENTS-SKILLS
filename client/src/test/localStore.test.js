import { describe, it, expect, beforeEach } from 'vitest';
import {
  isLocalMode,
  localSkills,
  localAssessments,
  localClassroomPerformances,
  localCompetitionPerformances,
  localAuth,
  localClasses,
  localStudents,
  DEMO_USERS,
  initLocalStore,
} from '../services/localStore';
import { SKILL_AREAS_CONFIG } from '../config/skillsTaxonomy';

describe('LocalStore & Skills Areas Module Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    initLocalStore();
  });

  it('identifies local-only mode correctly without any MongoDB or external DB requirement', () => {
    expect(isLocalMode()).toBe(true);
  });

  describe('Module 1: 12 Skill Areas & Sub-Skills Taxonomy', () => {
    const EXPECTED_AREAS = [
      'Academic',
      'Language Skills',
      'Thinking',
      'Social and Emotional',
      'Life Skills',
      'Digital',
      'Values',
      'Health',
      'Sports',
      'Extracurricular',
      'Creative',
      'Vocational',
    ];

    it('loads exactly 12 Skill Areas in the exact specified order', async () => {
      const res = await localSkills.listAreas();
      expect(res.data.success).toBe(true);
      expect(res.data.data.length).toBe(12);

      const names = res.data.data.map((a) => a.name);
      expect(names).toEqual(EXPECTED_AREAS);
    });

    it('Academic category contains only Communication, Numeracy, and Scientific Thinking', async () => {
      const areasRes = await localSkills.listAreas();
      const academicArea = areasRes.data.data.find((a) => a.name === 'Academic');
      expect(academicArea).toBeDefined();

      const subRes = await localSkills.listSubSkills({ skillArea: academicArea._id });
      const subNames = subRes.data.data.map((s) => s.name);
      expect(subNames).toEqual(['Communication', 'Numeracy', 'Scientific Thinking']);
    });

    it('verifies exact total count of 53 sub-skills across all categories', async () => {
      const allSubsRes = await localSkills.listSubSkills();
      expect(allSubsRes.data.data.length).toBe(53);

      // Verify master config matches
      const configTotal = SKILL_AREAS_CONFIG.reduce((acc, curr) => acc + curr.subSkills.length, 0);
      expect(configTotal).toBe(53);
    });

    it('sports category contains all 6 specified sub-skills', async () => {
      const areasRes = await localSkills.listAreas();
      const sports = areasRes.data.data.find((a) => a.name === 'Sports');
      const subRes = await localSkills.listSubSkills({ skillArea: sports._id });
      const names = subRes.data.data.map((s) => s.name);
      expect(names).toEqual([
        'Coordination',
        'Team Games',
        'Athletics',
        'Yoga',
        'Self-Defence',
        'Sportsmanship',
      ]);
    });

    it('extracurricular category contains all 10 specified sub-skills', async () => {
      const areasRes = await localSkills.listAreas();
      const extra = areasRes.data.data.find((a) => a.name === 'Extracurricular');
      const subRes = await localSkills.listSubSkills({ skillArea: extra._id });
      expect(subRes.data.data.length).toBe(10);
      const names = subRes.data.data.map((s) => s.name);
      expect(names).toContain('NCC/NSS/Scouts');
      expect(names).toContain('Art and Craft');
      expect(names).toContain('Debate');
    });
  });

  describe('Module 4: Classroom Performance Tracking', () => {
    it('creates a classroom performance record with files and photos with descriptions', async () => {
      const payload = {
        skillArea: 'area_academic',
        subSkill: 'sub_academic_numeracy',
        class: 'class_5',
        student: 'student_demo_1', // belongs to class_5
        activityTitle: 'Mental Math & Speed Calculation',
        performanceDescription: 'Solved complex two-digit mental multiplications within 45 seconds.',
        performanceDate: '2026-10-20',
        teacherObservation: 'Exceptional speed and number sense.',
        performanceLevel: 'Advanced',
        supportingFiles: [
          {
            id: 'file_test_1',
            name: 'numeracy_worksheet.pdf',
            size: 2048,
            type: 'application/pdf',
            description: 'Mathematics speed test response sheet',
          },
        ],
        photos: [
          {
            id: 'photo_test_1',
            name: 'numeracy_board.jpg',
            size: 5120,
            type: 'image/jpeg',
            description: 'Student demonstrating mental math solution on classroom smartboard',
          },
        ],
      };

      const res = await localClassroomPerformances.create(payload);
      expect(res.data.success).toBe(true);
      expect(res.data.data._id).toBeDefined();
      expect(res.data.data.activityTitle).toBe('Mental Math & Speed Calculation');
      expect(res.data.data.performanceLevel).toBe('Advanced');
      expect(res.data.data.student.name).toBe('Demo Student');
      expect(res.data.data.supportingFiles[0].description).toBe('Mathematics speed test response sheet');
      expect(res.data.data.photos[0].description).toBe('Student demonstrating mental math solution on classroom smartboard');
    });

    it('validates student-class relationship and rejects mismatch', async () => {
      // student_demo_1 belongs to class_5. Trying to save with class_6 must fail!
      const invalidPayload = {
        skillArea: 'area_academic',
        subSkill: 'sub_academic_numeracy',
        class: 'class_6',
        student: 'student_demo_1', // belongs to class_5
        activityTitle: 'Classroom Mismatch Test',
        performanceDate: '2026-10-20',
        performanceLevel: 'Proficient',
      };

      await expect(localClassroomPerformances.create(invalidPayload)).rejects.toThrow(
        'Selected student does not belong to the selected class'
      );
    });

    it('validates mandatory required fields for classroom performance', async () => {
      await expect(localClassroomPerformances.create({ activityTitle: 'Missing Class' })).rejects.toThrow(
        'Class is required'
      );
      await expect(localClassroomPerformances.create({ class: 'class_5' })).rejects.toThrow(
        'Student is required'
      );
      await expect(localClassroomPerformances.create({ class: 'class_5', student: 'student_demo_1' })).rejects.toThrow(
        'Activity Title is required'
      );
    });

    it('adding a new classroom performance does not overwrite previous records', async () => {
      const initialRes = await localClassroomPerformances.list({ student: 'student_demo_1' });
      const initialCount = initialRes.data.data.length;

      await localClassroomPerformances.create({
        skillArea: 'area_academic',
        subSkill: 'sub_academic_comm',
        class: 'class_5',
        student: 'student_demo_1',
        activityTitle: 'Record A',
        performanceDate: '2026-10-18',
        performanceLevel: 'Developing',
      });

      await localClassroomPerformances.create({
        skillArea: 'area_academic',
        subSkill: 'sub_academic_comm',
        class: 'class_5',
        student: 'student_demo_1',
        activityTitle: 'Record B',
        performanceDate: '2026-10-19',
        performanceLevel: 'Proficient',
      });

      const updatedRes = await localClassroomPerformances.list({ student: 'student_demo_1' });
      expect(updatedRes.data.data.length).toBe(initialCount + 2);
      const titles = updatedRes.data.data.map((r) => r.activityTitle);
      expect(titles).toContain('Record A');
      expect(titles).toContain('Record B');
    });

    it('supports updating and deleting classroom performance records', async () => {
      const createRes = await localClassroomPerformances.create({
        skillArea: 'area_academic',
        subSkill: 'sub_academic_comm',
        class: 'class_5',
        student: 'student_demo_1',
        activityTitle: 'Original Title',
        performanceDate: '2026-10-15',
        performanceLevel: 'Beginner',
      });
      const id = createRes.data.data._id;

      const updateRes = await localClassroomPerformances.update(id, {
        activityTitle: 'Updated Title',
        performanceLevel: 'Developing',
      });
      expect(updateRes.data.data.activityTitle).toBe('Updated Title');
      expect(updateRes.data.data.performanceLevel).toBe('Developing');

      const delRes = await localClassroomPerformances.delete(id);
      expect(delRes.data.success).toBe(true);

      const listAfter = await localClassroomPerformances.list();
      expect(listAfter.data.data.find((r) => r._id === id)).toBeUndefined();
    });
  });

  describe('Module 5: Competition Performance Tracking', () => {
    it('creates a competition record with Participated status without requiring winning rank', async () => {
      const payload = {
        skillArea: 'area_sports',
        subSkill: 'sub_sports_athletics',
        class: 'class_5',
        student: 'student_demo_1',
        competitionName: 'Inter-School Athletics Meet',
        competitionType: 'Inter-School',
        competitionDate: '2026-10-12',
        organizer: 'District Sports Authority',
        participationStatus: 'Participated',
        achievement: 'Participation',
        description: 'Competed in the 100m sprint heats.',
        supportingFiles: [
          {
            id: 'cert_1',
            name: 'participation_cert.pdf',
            size: 1500,
            type: 'application/pdf',
            description: 'Official participation certificate from organizer',
          },
        ],
      };

      const res = await localCompetitionPerformances.create(payload);
      expect(res.data.success).toBe(true);
      expect(res.data.data.participationStatus).toBe('Participated');
      expect(res.data.data.achievement).toBe('Participation');
      expect(res.data.data.supportingFiles[0].description).toBe('Official participation certificate from organizer');
    });

    it('validates that Winner status requires an achievement or rank other than Participation', async () => {
      const invalidWinner = {
        skillArea: 'area_sports',
        subSkill: 'sub_sports_athletics',
        class: 'class_5',
        student: 'student_demo_1',
        competitionName: 'Zonal Championship',
        competitionDate: '2026-10-10',
        participationStatus: 'Winner',
        achievement: 'Participation', // invalid for Winner!
      };

      await expect(localCompetitionPerformances.create(invalidWinner)).rejects.toThrow(
        'Winner status requires a valid winning achievement or rank'
      );
    });

    it('creates Winner competition record with valid rank and photo description', async () => {
      const validWinner = {
        skillArea: 'area_sports',
        subSkill: 'sub_sports_athletics',
        class: 'class_5',
        student: 'student_demo_1',
        competitionName: 'State Science & Robotics Championship',
        competitionType: 'State',
        competitionDate: '2026-10-05',
        organizer: 'State Education Board',
        participationStatus: 'Winner',
        achievement: 'First Place',
        awardDetails: 'Gold Medal and Cash Prize of ₹5000',
        description: 'First prize in 400m relay sprint.',
        photos: [
          {
            id: 'photo_winner_1',
            name: 'gold_medal_podium.jpg',
            size: 4096,
            type: 'image/jpeg',
            description: 'Student on the podium receiving gold medal from the Chief Guest',
          },
        ],
      };

      const res = await localCompetitionPerformances.create(validWinner);
      expect(res.data.success).toBe(true);
      expect(res.data.data.participationStatus).toBe('Winner');
      expect(res.data.data.achievement).toBe('First Place');
      expect(res.data.data.awardDetails).toContain('Gold Medal');
      expect(res.data.data.photos[0].description).toBe('Student on the podium receiving gold medal from the Chief Guest');
    });
  });

  describe('Module 8: Student Profile Portfolio Integration', () => {
    it('retrieves only records belonging to the selected student', async () => {
      const student1Crp = await localClassroomPerformances.list({ student: 'student_demo_1' });
      const student1Cmp = await localCompetitionPerformances.list({ student: 'student_demo_1' });

      // All returned records must belong to student_demo_1
      student1Crp.data.data.forEach((r) => {
        expect(r.student._id).toBe('student_demo_1');
      });
      student1Cmp.data.data.forEach((r) => {
        expect(r.student._id).toBe('student_demo_1');
      });

      // Filter for another student
      const student3Crp = await localClassroomPerformances.list({ student: 'student_demo_3' });
      student3Crp.data.data.forEach((r) => {
        expect(r.student._id).toBe('student_demo_3');
      });
    });

    it('returns empty list when student has no records, ensuring clean empty states', async () => {
      const emptyCrp = await localClassroomPerformances.list({ student: 'non_existent_student_999' });
      expect(emptyCrp.data.data).toEqual([]);

      const emptyCmp = await localCompetitionPerformances.list({ student: 'non_existent_student_999' });
      expect(emptyCmp.data.data).toEqual([]);
    });
  });

  describe('Authentication & Roles Preservation', () => {
    it('defines demo accounts matching all 3 staff roles', () => {
      const roles = DEMO_USERS.map((u) => u.role);
      expect(roles).toContain('admin');
      expect(roles).toContain('class_teacher');
      expect(roles).toContain('skill_teacher');
      expect(roles).not.toContain('student');
      expect(roles).not.toContain('parent');
    });

    it('authenticates valid demo credentials successfully', async () => {
      const res = await localAuth.login('admin@demo.ksv', 'Demo@1234');
      expect(res.data.success).toBe(true);
      expect(res.data.data.user.role).toBe('admin');
      expect(res.data.data.accessToken).toBeDefined();
      expect(localStorage.getItem('accessToken')).toBe(res.data.data.accessToken);
    });

    it('rejects invalid password with 401', async () => {
      await expect(localAuth.login('admin@demo.ksv', 'WrongPass')).rejects.toThrow('Invalid credentials');
    });

    it('allows class teacher session recovery', async () => {
      await localAuth.login('classteacher@demo.ksv', 'Demo@1234');
      const meRes = await localAuth.getMe();
      expect(meRes.data.success).toBe(true);
      expect(meRes.data.data.role).toBe('class_teacher');
    });

    it('allows skills teacher session recovery', async () => {
      await localAuth.login('skillteacher@demo.ksv', 'Demo@1234');
      const meRes = await localAuth.getMe();
      expect(meRes.data.success).toBe(true);
      expect(meRes.data.data.role).toBe('skill_teacher');
    });
  });
});
