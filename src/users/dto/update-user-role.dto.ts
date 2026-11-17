import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['STUDENT', 'RECRUITER', 'ADMIN'], example: 'RECRUITER' })
  @IsIn(['STUDENT', 'RECRUITER', 'ADMIN'], {
    message: 'role must be STUDENT, RECRUITER or ADMIN',
  })
  role: string;
}
