import { UserRole } from '../enums/userRole.js';
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}
