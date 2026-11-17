import { IsEnum, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';


export class RecruiterProfileDto {

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @MinLength(2)
    name?:string | null;

    @IsOptional()
    @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'phone must be a valid phone number' })
    phone?:string | null

    @IsOptional()
    @IsUrl({require_protocol: true}, { message: 'imageUrl must be a valid URL' })
    @MaxLength(255)
    ImageUrl?:string | null

    @IsOptional()
    @IsString() 
    @MaxLength(1000)
    bio?: string | null;
}