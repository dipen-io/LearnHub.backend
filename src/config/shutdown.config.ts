import { INestApplication } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export async function setupShutdownHooks(app: INestApplication) {
  app.enableShutdownHooks();

  const logger = await app.resolve(PinoLogger);

  process.on('SIGINT', async () => {
    logger.info('🛑 SIGINT received. Gracefully shutting down...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 SIGTERM received. Gracefully shutting down...');
    await app.close();
    process.exit(0);
  });
}
