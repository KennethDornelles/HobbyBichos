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
  ): Promise<{ id: string; role: string; storeId: string | null }> {
    this.logger.debug(`Validando payload do JWT: ${JSON.stringify(payload)}`);
    // Retorna os dados do payload com chave 'id' (não 'userId')
    return {
      id: payload.id,
      role: payload.role,
      storeId: payload.storeId ?? null,
    };
  }
}
