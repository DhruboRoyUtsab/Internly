import { Controller } from '@nestjs/common';
import { RecruitersService } from './recruiters.service.js';

@Controller('recruiters')
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}
}
