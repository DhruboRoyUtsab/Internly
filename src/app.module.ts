import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [RecruitersModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
