import { join } from 'path';
import { register } from 'tsconfig-paths';

register({
  baseUrl: join(__dirname, '..'),
  paths: {
    '@domain/*': ['dist/domain/*'],
    '@application/*': ['dist/application/*'],
    '@infrastructure/*': ['dist/infrastructure/*'],
    '@interfaces/*': ['dist/interfaces/*'],
  },
});

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Product Checkout API')
    .setDescription('Onboarding checkout API for technical challenge')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
