export const APPLICATION_STATUSES = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'OFFERED',
  'REJECTED',
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_TRANSITIONS: Record<string, readonly string[]> =
  {
    APPLIED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
    SHORTLISTED: ['OFFERED', 'REJECTED'],
    OFFERED: [],
    REJECTED: [],
  };
