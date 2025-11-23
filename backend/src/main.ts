import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Serverless handler for Vercel
let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Enable CORS for all origins (public API)
  app.enableCors({
    origin: '*',
    credentials: false,
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

// Vercel serverless export
export default async (req: any, res: any) => {
  const app = await createApp();
  return app(req, res);
};

// Local development bootstrap
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: false,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Scholar-Fi Backend running on http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for all origins`);
}

// Only run bootstrap in local development (not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  bootstrap();
}
