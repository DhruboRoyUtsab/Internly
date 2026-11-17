import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { APPLICATION_STATUSES } from '../constants/application-status.constant.js';

export class UpdateApplicationStatusDto {
  @IsIn(APPLICATION_STATUSES)
  @IsNotEmpty()
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
