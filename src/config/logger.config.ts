import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const loggerConfig: LoggerModuleAsyncParams = {
  useFactory: () => ({
    pinoHttp: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined, // JSON logs in production
      level: process.env.LOG_LEVEL || 'info',
    },
  }),
};
