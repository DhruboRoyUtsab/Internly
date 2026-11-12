export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

export const ACCESS_TOKEN_EXPIRES =
  (process.env.JWT_ACCESS_EXPIRES as any) ?? '1m';
export const REFRESH_TOKEN_EXPIRES =
  (process.env.JWT_REFRESH_EXPIRES as any) ?? '1d';
