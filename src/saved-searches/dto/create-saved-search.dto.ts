import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsObject()
  filters!: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;
}
