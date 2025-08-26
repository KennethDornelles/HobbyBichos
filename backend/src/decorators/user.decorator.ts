import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User as UserInterface } from '../interfaces/user.interface';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInterface => {
    const request: { user: UserInterface } = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
