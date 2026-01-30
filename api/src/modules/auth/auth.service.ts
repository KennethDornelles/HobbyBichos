import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserPayload } from './models/UserPayload';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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

    // Generate tokens
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async login(email: string, password: string) {
    // Normalização: tentar variações comuns de separadores no local-part
    const [local, domain] = email.split('@');
    const variants = Array.from(
      new Set([
        email,
        domain ? `${local.replace(/-/g, '.')}@${domain}` : email,
        domain ? `${local.replace(/\./g, '-')}@${domain}` : email,
      ]),
    );

    const user = await this.prisma.user.findFirst({
      where: { email: { in: variants } },
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

    // Gera tokens
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
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

  /**
   * Generate a new refresh token and store it in the database
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // Generate a secure random token
    const rawToken = crypto.randomBytes(64).toString('hex');
    
    // Hash the token before storing (for security)
    const hashedToken = await bcrypt.hash(rawToken, 10);
    
    // Calculate expiration date
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresIn);

    // Store in database
    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt,
      },
    });

    // Return the raw token (user stores this, we store the hash)
    return rawToken;
  }

  /**
   * Refresh the access token using a valid refresh token
   * Implements token rotation for security
   */
  async refreshAccessToken(refreshToken: string) {
    // Find all non-expired tokens for comparison
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    // Compare the provided token with stored hashes
    let validTokenRecord: (typeof storedTokens)[0] | null = null;
    for (const tokenRecord of storedTokens) {
      if (await bcrypt.compare(refreshToken, tokenRecord.token)) {
        validTokenRecord = tokenRecord;
        break;
      }
    }

    if (!validTokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { user } = validTokenRecord;

    // Delete the used refresh token (rotation)
    await this.prisma.refreshToken.delete({
      where: { id: validTokenRecord.id },
    });

    // Generate new tokens
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  /**
   * Revoke a specific refresh token (logout)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    // Find all tokens for comparison
    const storedTokens = await this.prisma.refreshToken.findMany();

    // Compare and delete the matching token
    for (const tokenRecord of storedTokens) {
      if (await bcrypt.compare(refreshToken, tokenRecord.token)) {
        await this.prisma.refreshToken.delete({
          where: { id: tokenRecord.id },
        });
        return;
      }
    }

    // If token not found, it might already be revoked - that's okay
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clean up expired refresh tokens (can be called by a scheduled job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
