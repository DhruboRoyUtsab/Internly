import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser } from "../interfaces/authhenticated.user.interface.js";



export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined =>
    ctx.switchToHttp().getRequest().user ?? undefined
);