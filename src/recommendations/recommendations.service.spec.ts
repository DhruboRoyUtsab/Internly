import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecommendationsService } from './recommendations.service.js';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let mockAuditLogsService: any;

  beforeEach(() => {
    mockAuditLogsService = {
      log: vi.fn().mockResolvedValue({ id: 'log-1' }),
    };
    service = new RecommendationsService(mockAuditLogsService);
  });

  it('should return personalized recommendations with match scores and explanations', async () => {
    const result = await service.getRecommendations('student-123');

    expect(result.studentId).toBe('student-123');
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0]).toHaveProperty('matchScore');
    expect(result.recommendations[0]).toHaveProperty('explanation');
    expect(result.recommendations[0]).toHaveProperty('matchingSkills');
    expect(mockAuditLogsService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'student-123',
        action: 'VIEW_PREMIUM_RECOMMENDATIONS',
      }),
    );
  });

  it('should return detailed competition insights for an internship', async () => {
    const result = await service.getInternshipInsights('internship-abc', 'student-123');

    expect(result.internshipId).toBe('internship-abc');
    expect(result.totalApplicants).toBeGreaterThan(0);
    expect(result.competitionLevel).toBe('MEDIUM');
    expect(result.topUniversities.length).toBeGreaterThan(0);
    expect(result.topSkillsInPool.length).toBeGreaterThan(0);
    expect(mockAuditLogsService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'student-123',
        action: 'VIEW_INTERNSHIP_INSIGHTS',
      }),
    );
  });
});
