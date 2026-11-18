import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DemoPayDto {
  @ApiPropertyOptional({
    description: 'UUID of the plan to subscribe to. If omitted, defaults to the $4.99 Premium Student Plan.',
    example: 'c8b417c8-7b96-48cb-9610-8bfa17cb1204',
  })
  @IsUUID()
  @IsOptional()
  planId?: string;
}
