import { type INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ApiErrorDto } from './common/presentation/api-error';
import { createGlobalValidationPipe } from './common/presentation/global-validation.pipe';
import { AppConfigService } from './config/app-config.service';

export const API_DEFAULT_VERSION = '1';

/**
 * HTTP pipeline shared by `main.ts` and the e2e tests, so tests exercise the
 * exact same versioning, validation and docs setup as production.
 */
export function setupApp(app: INestApplication): void {
  const config = app.get(AppConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGINS'), credentials: true });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_DEFAULT_VERSION });
  app.useGlobalPipes(createGlobalValidationPipe());
  app.enableShutdownHooks();

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Wazn API')
      .setDescription('Gym price comparison marketplace — members, gym portal and admin.')
      .setVersion(API_DEFAULT_VERSION)
      .addBearerAuth()
      .build(),
    { extraModels: [ApiErrorDto] },
  );
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs-json' });
}
