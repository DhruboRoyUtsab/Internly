import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PremiumEntitlementService } from '../premium-entitlement.service.js';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly entitlementService: PremiumEntitlementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('Authentication required before checking Premium status.');
    }

    // Admins bypass premium check to test or view system
    if (user.role === 'ADMIN') {
      return true;
    }

    const isPremium = await this.entitlementService.isStudentPremium(user.id);
    if (!isPremium) {
      throw new ForbiddenException(
        'Access denied: This feature requires an active Premium subscription ($4.99/mo).',
      );
    }

    return true;
  }
}
