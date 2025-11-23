import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (allow both common Vite ports)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Scholar-Fi Backend running on http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN}`);
}

bootstrap();
