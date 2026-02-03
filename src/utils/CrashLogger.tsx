import AsyncStorage from '@react-native-async-storage/async-storage';

class CrashLogger {
  private logs: string[] = [];
  private MAX_LOGS = 1000;

  log(message: string, data?: string | object) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data, null, 2) : ''}`;

     this.logs.push(logEntry);

    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Save to AsyncStorage immediately
    this.saveLogs();
  }

  async saveLogs() {
    try {
      await AsyncStorage.setItem('@crash_logs', JSON.stringify(this.logs));
    } catch (e) {
     }
  }

  async getLogs(): Promise<string[]> {
    try {
      const logs = await AsyncStorage.getItem('@crash_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
       return [];
    }
  }

  async clearLogs() {
    this.logs = [];
    await AsyncStorage.removeItem('@crash_logs');
  }

  // Get logs as formatted string
  async getLogsAsString(): Promise<string> {
    const logs = await this.getLogs();
    return logs.join('\n');
  }
}

export const crashLogger = new CrashLogger();