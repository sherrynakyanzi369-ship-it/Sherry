import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/dist/app.module';
import type { IncomingMessage, ServerResponse } from 'http';

let appPromise: ReturnType<typeof createApp> | null = null;

async function createApp() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.init();
  return app;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await (appPromise ??= createApp());
  const server: (req: IncomingMessage, res: ServerResponse) => unknown =
    app.getHttpAdapter().getInstance();
  if (!(req.url || '').startsWith('/api')) {
    req.url = `/api${req.url || '/'}`;
  }
  return server(req, res);
}