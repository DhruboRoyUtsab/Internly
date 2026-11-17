import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AuthenticatedUserPayload {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? undefined;
  },
);
