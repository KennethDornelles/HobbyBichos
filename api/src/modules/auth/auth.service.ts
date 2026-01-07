import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserPayload } from './models/UserPayload';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';
// import { BrevoService } from './brevo.service';
import { PasswordForgotService } from './password-forgot.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    // private readonly brevoService: BrevoService,
    private readonly passwordForgotService: PasswordForgotService,
  ) {}

  async register(registerDto: RegisterDto & { storeId?: string }) {
    // Verifica se o email ou telefone já está em uso
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { phone: registerDto.phone }],
      },
    });
    if (existingUser) {
      throw new ConflictException('Email ou telefone já está em uso');
    }
    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone || '',
        role: Role.CLIENT,
        storeId: registerDto.storeId ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeId: true,
        createdAt: true,
      },
    });
    // Envio de email via BrevoService
    // await this.brevoService.sendWelcomeEmail(user.email);
    // Gera o token JWT
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    // Verifica se o usuário existe e se a senha está correta
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    // Cria o payload do token JWT incluindo storeId
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };
    // Gera o token JWT
    const token = this.jwtService.sign(payload);
    // Retorna o token de acesso
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        storeId: user.storeId,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
