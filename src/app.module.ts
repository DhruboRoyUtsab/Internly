import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { RecruitersModule } from './recruiters/recruiters.module.js';
import { InternshipsModule } from './internships/internships.module.js';
import { UsersStubModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD') ?? '',
        database: config.get<string>('DB_NAME', 'internly'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersStubModule,
    RecruitersModule,
    InternshipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
