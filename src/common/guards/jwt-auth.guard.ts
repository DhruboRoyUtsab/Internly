import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // If an upstream passport/jwt strategy already attached req.user
    if (request.user) {
      return true;
    }

    // Support dev/testing header fallback if Bearer JWT is not yet issued by Member 1
    const authHeader = request.headers.authorization;
    const testUserId = request.headers['x-user-id'] as string;
    const testRole = (request.headers['x-user-role'] as string) || 'STUDENT';
    const testEmail = (request.headers['x-user-email'] as string) || 'student@internly.edu';

    if (testUserId) {
      request.user = {
        id: testUserId,
        email: testEmail,
        role: testRole.toUpperCase(),
      };
      return true;
    }

    if (!authHeader) {
      throw new UnauthorizedException('Authentication token or x-user-id header is required.');
    }

    // For Bearer token string (mock or parsed)
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('Invalid authorization token format.');
    }

    // Attach basic user context if decoded
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'student@internly.edu',
      role: 'STUDENT',
    };

    return true;
  }
}
