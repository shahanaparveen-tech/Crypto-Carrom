import winston from 'winston';

import { env, isProduction } from '../config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts as string} ${level}: ${(stack as string) ?? (message as string)}${metaString}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: env.APP_NAME },
  transports: [new winston.transports.Console()],
});

/** Express-friendly stream so morgan/http logs route through winston. */
export const loggerStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
