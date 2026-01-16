import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserFromJwt } from '../models/UserFromJwt';
import { UserPayload } from '../models/UserPayload';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default_secret_key',
    });

    this.logger.log(
      `JwtStrategy inicializada com secret: ${configService.get<string>('JWT_SECRET') ? 'configurado' : 'usando default'}`,
    );
  }

  async validate(
    payload: UserPayload,
  ): Promise<{
    id: string;
    role: string;
    storeId: string | null;
    email: string;
  }> {
    this.logger.debug(`Validando payload do JWT: ${JSON.stringify(payload)}`);
    // Busca o usuário atualizado no banco de dados
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        storeId: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    this.logger.debug(
      `Usuário atualizado do banco: ${user.email} (role: ${user.role})`,
    );
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId ?? null,
    };
  }
}
