import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['STUDENT', 'RECRUITER', 'ADMIN'], {
    message: 'role must be STUDENT, RECRUITER or ADMIN',
  })
  role: string;
}
