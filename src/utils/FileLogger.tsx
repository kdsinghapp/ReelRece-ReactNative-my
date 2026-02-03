import RNFS from 'react-native-fs';

// ✅ SECURITY: Sensitive keys that should be redacted from logs
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

class FileLogger {
  private logFilePath: string;
  private isInitialized: boolean = false;
  private logBuffer: string[] = [];
  private writeTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Store logs in the Documents directory so they persist
    this.logFilePath = `${RNFS.DocumentDirectoryPath}/app_debug_logs.txt`;
    this.initialize();
  }

  private async initialize() {
    try {
      // Clear the log file on app start
      await RNFS.writeFile(this.logFilePath, `=== App Started: ${new Date().toISOString()} ===\n`, 'utf8');
      this.isInitialized = true;
     
      if (this.logBuffer.length > 0) {
        await this.flushBuffer();
      }
    } catch (error) {
     }
  }

  private async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToWrite = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const content = logsToWrite.join('\n') + '\n';
      await RNFS.appendFile(this.logFilePath, content, 'utf8');
    } catch (error) {
       // Re-add to buffer if write failed
      this.logBuffer = [...logsToWrite, ...this.logBuffer];
    }
  }

  private scheduleWrite() {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    // Batch writes every 100ms to avoid too many file operations
    this.writeTimer = setTimeout(() => {
      this.flushBuffer();
    }, 100);
  }

  /**
   * ✅ SECURITY: Filters sensitive data from objects before logging
   * Replaces sensitive values with [REDACTED]
   */
  private filterSensitiveData(data: unknown): unknown {
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

  log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, data?: string | object ) {
    const timestamp = new Date().toISOString();
    // ✅ SECURITY: Filter sensitive data before logging to file
    const safeData = data ? this.filterSensitiveData(data) : undefined;
    const logEntry = `[${timestamp}] [${level}] ${message}${safeData ? ': ' + JSON.stringify(safeData, null, 2) : ''}`;

 
    // Add to buffer for file writing
    this.logBuffer.push(logEntry);

    if (this.isInitialized) {
      this.scheduleWrite();
    }
  }

  /**
   * ✅ SECURITY: Debug logs only work in __DEV__ mode
   */
  debug(message: string, data?: string | object) {
    if (!__DEV__) return; // Disabled in production
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: string | object) {
    if (!__DEV__) return; // Disabled in production
    this.log('INFO', message, data);
  }

  warn(message: string, data?: string | object) {
    // Warn logs allowed in production (useful for non-sensitive warnings)
    this.log('WARN', message, data);
  }

  error(message: string, data?: string | object) {
    // Error logs allowed in production (useful for crash reporting)
    this.log('ERROR', message, data);
  }

  // Get the log file path (useful for displaying in UI)
  getLogPath(): string {
    return this.logFilePath;
  }

  // Read current logs (useful for displaying in UI)
  async readLogs(): Promise<string> {
    try {
      if (await RNFS.exists(this.logFilePath)) {
        return await RNFS.readFile(this.logFilePath, 'utf8');
      }
      return 'No logs available';
    } catch (error) {
      return `Failed to read logs: ${error}`;
    }
  }

  // Clear logs manually if needed
  async clearLogs() {
    try {
      await RNFS.writeFile(this.logFilePath, `=== Logs Cleared: ${new Date().toISOString()} ===\n`, 'utf8');
      this.logBuffer = [];
     } catch (error) {
     }
  }
}

// Export singleton instance
export const fileLogger = new FileLogger();