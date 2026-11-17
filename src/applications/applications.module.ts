import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { Application } from './entities/application.entity.js';
import { ApplicationStatusHistory } from './entities/application-status-history.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationStatusHistory])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
