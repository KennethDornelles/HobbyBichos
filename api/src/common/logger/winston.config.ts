import * as winston from 'winston';
import * as path from 'path';

const logDir = 'logs';

const safeFormat = winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
  return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${stack ? stack : ''} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info', // Default to info
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        safeFormat,
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      dirname: logDir,
      filename: 'combined.log',
      level: 'info',
    }),
    // File transport for errors only
    new winston.transports.File({
      dirname: logDir,
      filename: 'error.log',
      level: 'error',
    }),
  ],
};
