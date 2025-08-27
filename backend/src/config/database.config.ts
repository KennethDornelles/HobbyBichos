import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    const host = this.configService.get<string>('DATABASE_HOST');
    const port = this.configService.get<string>('DATABASE_PORT');
    const user = this.configService.get<string>('DATABASE_USER');
    const password = this.configService.get<string>('DATABASE_PASSWORD');
    const database = this.configService.get<string>('DATABASE_NAME');
    const schema = this.configService.get<string>('DATABASE_SCHEMA', 'public');

    return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=${schema}`;
  }

  getDatabaseConfig() {
    return {
      host: this.configService.get<string>('DATABASE_HOST'),
      port: parseInt(this.configService.get<string>('DATABASE_PORT', '5432')),
      user: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      schema: this.configService.get<string>('DATABASE_SCHEMA', 'public'),
    };
  }
}
