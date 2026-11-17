import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  billingCycle?: string;

  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @IsString()
  @IsOptional()
  stripeProductId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
