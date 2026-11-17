import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PremiumGuard } from '../subscriptions/guards/premium.guard.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Recommendations')
@ApiBearerAuth('JWT-auth')
@Controller('recommendations')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(@CurrentUser() user: AuthenticatedUserPayload) {
    return await this.recommendationsService.getRecommendations(user.id);
  }
}
