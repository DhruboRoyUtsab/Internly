import{
    IsNotEmpty,
    IsString,
    IsOptional,
    MaxLength,
} from 'class-validator'

export class UpdateApplicationStatusDto{
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    status!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}