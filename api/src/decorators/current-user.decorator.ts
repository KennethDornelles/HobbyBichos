import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se especificar uma propriedade, retorna apenas ela
    if (data) {
      return user?.[data];
    }

    // Caso contrário, retorna o objeto inteiro
    return user;
  },
);
