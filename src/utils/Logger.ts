/**
 * Enhanced Logger for React Native 0.77
 * - debug() only works in __DEV__ mode
 * - Sensitive data (passwords, tokens, secrets) are automatically filtered
 * - Production logs are minimal for security
 */

type ConsoleMethods = {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
};

// Sensitive keys that should be redacted from logs
const SENSITIVE_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'credential',
  'private',
  'pin',
  'otp',
  'cvv',
  'ssn',
];

class Logger {
  private static logs: Array<{
    level: 'log' | 'warn' | 'error' | 'info' | 'debug';
    message: string;
    timestamp: Date;
    data?: string | object;
  }> = [];

  private static nativeConsole: ConsoleMethods = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  private static colors = {
    log: '\x1b[37m',    // white
    info: '\x1b[36m',   // cyan
    warn: '\x1b[33m',   // yellow
    error: '\x1b[31m',  // red
    debug: '\x1b[35m',  // magenta
    reset: '\x1b[0m'
  };

  /**
   * Filters sensitive data from objects before logging
   * Replaces sensitive values with [REDACTED]
   */
  private static filterSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.filterSensitiveData(item));
    }

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );

      if (isSensitive) {
        filtered[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  private static formatMessage(level: string, message: string, data?: string | object): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const color = this.colors[level as keyof typeof this.colors] || this.colors.log;
    const reset = this.colors.reset;

    let formatted = `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${reset}`;
    if (data) {
      // Filter sensitive data before logging
      const safeData = this.filterSensitiveData(data);
      formatted += '\n' + JSON.stringify(safeData, null, 2);
    }
    return formatted;
  }

  static setConsoleTarget(target: Partial<ConsoleMethods>) {
    this.nativeConsole = {
      ...this.nativeConsole,
      ...target,
    };
  }

  static log(message: string, data?: string | object) {
    const formatted = this.formatMessage('log', message, data);
    this.nativeConsole.log(formatted);
    this.logs.push({ level: 'log', message, timestamp: new Date(), data });
  }

  static info(message: string, data?: string | object) {
    const formatted = this.formatMessage('info', message, data);
    this.nativeConsole.info(formatted);
    this.logs.push({ level: 'info', message, timestamp: new Date(), data });
  }

  static warn(message: string, data?: string | object) {
    const formatted = this.formatMessage('warn', message, data);
    this.nativeConsole.warn(formatted);
    this.logs.push({ level: 'warn', message, timestamp: new Date(), data });
  }

  static error(message: string, data?: string | object) {
    const formatted = this.formatMessage('error', message, data);
    this.nativeConsole.error(formatted);
    this.logs.push({ level: 'error', message, timestamp: new Date(), data });
  }

  /**
   * Debug logs - ONLY works in __DEV__ mode
   * Completely blocked in production builds
   */
  static debug(message: string, data?: string | object) {
    // ⚠️ SECURITY: debug() is completely disabled in production
    if (!__DEV__) {
      return; // Silent return in production - no logging at all
    }
    
    const formatted = this.formatMessage('debug', message, data);
    this.nativeConsole.debug(formatted);
    this.logs.push({ level: 'debug', message, timestamp: new Date(), data });
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }

  /**
   * Check if debug logging is enabled (only in __DEV__)
   */
  static isDebugEnabled(): boolean {
    return __DEV__;
  }
}

export default Logger;