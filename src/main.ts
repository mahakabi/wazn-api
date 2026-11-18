import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { setupApp } from './setup-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const port = app.get(AppConfigService).get('PORT');
  await app.listen(port);
  Logger.log(`Wazn API on http://localhost:${port} — docs at /docs`, 'Bootstrap');
}

void bootstrap();
