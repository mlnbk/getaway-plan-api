import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: configService.get('WEB_URL'),
    methods: 'GET, PUT, POST',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(3000);
}
// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap();
