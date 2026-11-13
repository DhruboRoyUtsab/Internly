import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAlertPreferenceDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled!: boolean;

  @IsOptional()
  @IsBoolean()
  applicationUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  internshipAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
