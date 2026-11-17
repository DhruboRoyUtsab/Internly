import{
    IsNotEmpty,
    IsString,
} from 'class-validator'


export class CreateApplicationDto{
    @IsNotEmpty()
    @IsString()
    coverLetterText!: string;
}

