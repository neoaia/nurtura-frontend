type LogLevel = 'debug' | 'log' | 'warn' | 'error' | 'verbose';

interface LoggerOptions {
  context?: string;
  enabled?: boolean;
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

class Logger {
  private context: string;
  private enabled: boolean;

  constructor(context?: string) {
    this.context = context || 'App';
    this.enabled = __DEV__;
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  }

  private formatMessage(level: string, message: string, color: string, data?: any): void {
    if (!this.enabled) return;

    const timestamp = this.getTimestamp();
    const pid = 'RN';
    
    console.log(
      `${color}[${pid}] ${timestamp}  ${level.padEnd(5)} ${COLORS.yellow}[${this.context}]${COLORS.reset} ${color}${message}${COLORS.reset}`
    );

    if (data !== undefined) {
      const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      console.log(`${COLORS.gray}${dataStr}${COLORS.reset}`);
    }
  }

  log(message: string, data?: any): void {
    this.formatMessage('LOG', message, COLORS.green, data);
  }

  error(message: string, trace?: any): void {
    this.formatMessage('ERROR', message, COLORS.red);
    if (trace !== undefined) {
      if (trace instanceof Error) {
        console.error(`${COLORS.red}${trace.stack || trace.message}${COLORS.reset}`);
      } else {
        const traceStr = typeof trace === 'object' ? JSON.stringify(trace, null, 2) : String(trace);
        console.error(`${COLORS.red}${traceStr}${COLORS.reset}`);
      }
    }
  }

  warn(message: string, data?: any): void {
    this.formatMessage('WARN', message, COLORS.yellow, data);
  }

  debug(message: string, data?: any): void {
    this.formatMessage('DEBUG', message, COLORS.magenta, data);
  }

  verbose(message: string, data?: any): void {
    this.formatMessage('VERB', message, COLORS.cyan, data);
  }

  setContext(context: string): void {
    this.context = context;
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = new Logger();