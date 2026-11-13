import { IsUUID } from 'class-validator';

export class SaveInternshipDto {
  @IsUUID()
  internshipId!: string;
}




