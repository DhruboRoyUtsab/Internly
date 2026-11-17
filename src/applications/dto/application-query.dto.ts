import{
    IsInt,
    IsString,
    IsOptional,
    MaxLength,
    Max,
    Min,
} from 'class-validator'

import { Type } from 'class-transformer';

export class ApplicationQueryDto{
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @IsString()
    @MaxLength(30)
    status?: string;
}