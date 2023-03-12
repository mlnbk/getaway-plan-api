import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const options = new DocumentBuilder()
    .setTitle('GetawayPlan API')
    .setDescription('API for the GetawayPlan trip planning app')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: configService.get('WEB_URL'),
    methods: 'GET, DELETE, POST, PUT',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(3000);
}
// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap();
