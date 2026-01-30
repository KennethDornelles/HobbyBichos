import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordForgotService } from './password-forgot.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordForgotDto } from './dto/password-forgot.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import type { UserFromJwt } from './models/UserFromJwt';
import { ThrottleStrict } from '../../decorators/throttle.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordForgotService: PasswordForgotService,
  ) {}

  /**
   * POST /api/auth/forgot-password
   * Envia código de 6 dígitos por email
   */
  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperação de senha' })
  @ApiResponse({
    status: 200,
    description: 'Código enviado para o email (se existir)',
  })
  async forgotPassword(@Body() dto: PasswordForgotDto) {
    return this.passwordForgotService.requestPasswordReset(dto);
  }

  /**
   * POST /api/auth/reset-password
   * Redefine a senha usando código de 6 dígitos
   */
  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com código de 6 dígitos' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  async resetPassword(@Body() dto: PasswordResetDto) {
    return this.passwordForgotService.resetPassword(dto);
  }

  @Public()
  @ThrottleStrict()
  @Post('register')
  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'a1b2c3d4e5f6...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE', 'CLIENT'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @ThrottleStrict()
  @Post('login')
  @ApiOperation({ summary: 'Login e geração de token JWT' })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'a1b2c3d4e5f6...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: {
              type: 'string',
              enum: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE', 'CLIENT'],
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Email ou senha inválidos' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * POST /api/auth/refresh
   * Exchange refresh token for new access + refresh tokens
   */
  @Public()
  @ThrottleStrict()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  /**
   * POST /api/auth/logout
   * Revoke the provided refresh token
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revogar refresh token (logout)' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.revokeRefreshToken(dto.refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * POST /api/auth/logout-all
   * Revoke all refresh tokens for the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revogar todos os refresh tokens (logout de todos os dispositivos)' })
  @ApiResponse({ status: 200, description: 'Logout de todos os dispositivos realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async logoutAll(@CurrentUser() user: UserFromJwt) {
    await this.authService.revokeAllUserTokens(user.id);
    return { message: 'Logout de todos os dispositivos realizado com sucesso' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        role: {
          type: 'string',
          enum: ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE', 'CLIENT'],
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getProfile(@CurrentUser() user: UserFromJwt) {
    return this.authService.getProfile(user.id);
  }
}
