import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new (await import('@nestjs/common')).ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new GlobalHttpExceptionFilter(),
  );
  app.setGlobalPrefix('api');

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Hobby Bichos API')
    .setDescription('API para gestão multi-loja de Petshops')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT-auth',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
