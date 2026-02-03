import Logger from '@utils/Logger';

const BRIDGE_FLAG = '__logger_console_bridge_initialized__';

// ✅ GLOBAL LOG SUPPRESSION FLAG
// Set to true to suppress ALL logs globally (useful for production builds)
let SUPPRESS_ALL_LOGS = false;

/**
 * Enable/disable global log suppression
 * Call this BEFORE initializeLoggerConsoleBridge for best results
 */
export const setSuppressAllLogs = (suppress: boolean) => {
  SUPPRESS_ALL_LOGS = suppress;
};

/**
 * Check if logs are being suppressed
 */
export const isLogsSuppressed = () => SUPPRESS_ALL_LOGS;

const ensureStringMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const formatConsoleArguments = (args: unknown[]) => {
  if (args.length === 0) {
    return { message: '', data: undefined };
  }

  const [first, ...rest] = args;
  const message = first !== undefined ? ensureStringMessage(first) : '';

  if (rest.length === 0) {
    return { message, data: undefined };
  }

  return {
    message,
    data: rest.length === 1 ? rest[0] : rest,
  };
};

const overrideConsoleMethod = (
  methodName: 'log' | 'info' | 'warn' | 'error' | 'debug',
  loggerMethod: (message: string, data?: unknown) => void
) => {
  console[methodName] = (...args: unknown[]) => {
    // ✅ GLOBAL SUPPRESSION: Skip ALL logs if suppressed
    if (SUPPRESS_ALL_LOGS) {
      return; // Silent no-op
    }
    
    const { message, data } = formatConsoleArguments(args);
    loggerMethod(message || methodName.toUpperCase(), data);
  };
};

export const initializeLoggerConsoleBridge = () => {
  if ((globalThis as any)[BRIDGE_FLAG]) {
    return;
  }

  // ✅ AUTO-SUPPRESS in production builds
  if (!__DEV__) {
    SUPPRESS_ALL_LOGS = true;
  }

  const nativeConsole = {
    log: console.log.bind(console),
    
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  Logger.setConsoleTarget(nativeConsole);

  overrideConsoleMethod('log', Logger.log.bind(Logger));
  overrideConsoleMethod('info', Logger.info.bind(Logger));
  overrideConsoleMethod('warn', Logger.warn.bind(Logger));
  overrideConsoleMethod('error', Logger.error.bind(Logger));
  overrideConsoleMethod('debug', Logger.debug.bind(Logger));

  (globalThis as any)[BRIDGE_FLAG] = true;
};
