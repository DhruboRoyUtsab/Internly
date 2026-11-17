import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PremiumGuard } from '../subscriptions/guards/premium.guard.js';
import { CurrentUser, AuthenticatedUserPayload } from '../common/decorators/current-user.decorator.js';

@ApiTags('Insights')
@ApiBearerAuth('JWT-auth')
@Controller('internships')
export class InsightsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get(':id/insights')
  @UseGuards(JwtAuthGuard, PremiumGuard)
  async getInternshipInsights(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return await this.recommendationsService.getInternshipInsights(id, user.id);
  }
}
