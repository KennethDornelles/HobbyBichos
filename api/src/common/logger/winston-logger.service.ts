import { LoggerService, Injectable, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { winstonConfig } from './winston.config';

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = winston.createLogger(winstonConfig);
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.call('verbose', message, ...optionalParams);
  }

  private call(level: string, message: any, ...optionalParams: any[]) {
    const context = this.context || optionalParams.find((p) => typeof p === 'string') || 'Application';
    // If the message is an object, try to log it properly
    this.logger.log({
      level,
      message,
      context,
      meta: optionalParams,
    });
  }
}
