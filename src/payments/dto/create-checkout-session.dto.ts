import { IsUUID, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsUrl()
  @IsOptional()
  successUrl?: string;

  @IsUrl()
  @IsOptional()
  cancelUrl?: string;
}
