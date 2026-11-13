import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from './mail/mail.module.js';
import { StudentProfileModule } from './student-profile/student-profile.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'internly',
      autoLoadEntities: true,
      synchronize: true,
    }),
    RecruitersModule,
    UsersModule,
    AuthModule,
    MailModule,
    StudentProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
