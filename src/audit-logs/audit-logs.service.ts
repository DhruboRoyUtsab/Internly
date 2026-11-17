import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto.js';

export interface CreateAuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    try {
      const entry = this.auditLogRepository.create({
        actorId: params.actorId ?? null,
        actorEmail: params.actorEmail ?? null,
        actorRole: params.actorRole ?? null,
        action: params.action,
        entityName: params.entityName,
        entityId: params.entityId ?? null,
        oldValues: params.oldValues ?? null,
        newValues: params.newValues ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      });

      return await this.auditLogRepository.save(entry);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`);
      // Audit log failures should not crash user-facing business flow
      return null as any;
    }
  }

  async findAll(query: QueryAuditLogsDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    if (query.action) {
      queryBuilder.andWhere('log.action ILIKE :action', { action: `%${query.action}%` });
    }
    if (query.entityName) {
      queryBuilder.andWhere('log.entityName = :entityName', { entityName: query.entityName });
    }
    if (query.actorId) {
      queryBuilder.andWhere('log.actorId = :actorId', { actorId: query.actorId });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findOne({ where: { id } });
  }
}
