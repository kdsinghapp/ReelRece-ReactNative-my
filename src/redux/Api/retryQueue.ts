/**
 * Smart Retry Queue for Failed API Calls
 *
 * - Retries failed requests with exponential backoff (1s, 2s, 4s)
 * - Retryable: network errors, timeouts, 5xx, 429 (rate limit)
 * - Non-retryable: 401, 403, 404, other 4xx
 * - Queues GET requests that fail while offline and replays when network returns
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import NetInfo from '@react-native-community/netinfo';

// ─── Config ─────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const MAX_QUEUE_SIZE = 50;

// Safe-to-replay methods (no side effects on retry)
const REPLAY_SAFE_METHODS = new Set(['get', 'head', 'options']);

// ─── Types ─────────────────────────────────────────────────────────────
interface QueuedConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}

// ─── Retryability ──────────────────────────────────────────────────────

/** Check if error is retryable (network, timeout, 5xx, 429) */
export function isRetryableError(error: AxiosError & { isNetworkError?: boolean }): boolean {
  if (error.isNetworkError) return true;
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') return true;
  const status = error.response?.status;
  if (status && status >= 500) return true;
  if (status === 429) return true;
  return false;
}

/** Check if request is safe to replay when network returns (GET/HEAD/OPTIONS) */
function isReplaySafe(config: InternalAxiosRequestConfig): boolean {
  const method = (config.method || 'get').toLowerCase();
  return REPLAY_SAFE_METHODS.has(method);
}

/** Compute backoff delay with optional jitter (ms) */
export function getBackoffDelay(retryCount: number, jitter = true): number {
  const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
  if (jitter) {
    const jitterRange = delay * 0.2;
    return delay + (Math.random() * 2 - 1) * jitterRange;
  }
  return delay;
}

// ─── Retry Queue (for offline → online replay) ──────────────────────────

const queue: QueuedConfig[] = [];
let networkUnsubscribe: (() => void) | null = null;

function enqueue(config: QueuedConfig): void {
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }
  queue.push(config);
  ensureNetworkListener();
}

function ensureNetworkListener(): void {
  if (networkUnsubscribe) return;
  networkUnsubscribe = NetInfo.addEventListener(state => {
    const connected = state.isConnected ?? false;
    if (connected && queue.length > 0) {
      processQueue();
    }
  });
}

/** Process all queued requests when network is back */
async function processQueue(): Promise<void> {
  const toProcess = [...queue];
  queue.length = 0;

  for (const config of toProcess) {
    try {
      const { default: axiosInstance } = await import('./axiosInstance');
      config.__retryCount = 0;
      await axiosInstance.request(config);
    } catch {
      // Silently drop; original caller already received rejection
    }
  }
}

/** Add config to queue for replay when network returns (call only for replay-safe configs) */
export function queueForReconnect(config: QueuedConfig): void {
  if (!isReplaySafe(config)) return;
  enqueue(config);
}

/** Check if device is offline (async). Use to skip retries and queue immediately when offline. */
export async function isOffline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return !(state.isConnected ?? false);
  } catch {
    return true; // Assume offline on error
  }
}

// ─── Core Retry Logic ───────────────────────────────────────────────────

export interface RetryResult {
  shouldRetry: boolean;
  delayMs?: number;
  shouldQueue?: boolean;
}

/**
 * Decide retry behavior for a failed request.
 */
export function getRetryBehavior(
  error: AxiosError & { isNetworkError?: boolean },
  config: QueuedConfig
): RetryResult {
  if (!isRetryableError(error)) {
    return { shouldRetry: false };
  }

  const retryCount = config.__retryCount ?? 0;

  if (retryCount >= MAX_RETRIES) {
    // Exhausted retries; queue for reconnect if offline + replay-safe
    const shouldQueue =
      (error.isNetworkError || error.message === 'Network Error' || error.code === 'ECONNABORTED') &&
      isReplaySafe(config);
    return {
      shouldRetry: false,
      shouldQueue: !!shouldQueue,
    };
  }

  return {
    shouldRetry: true,
    delayMs: getBackoffDelay(retryCount),
  };
}

/**
 * Sleep for given milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
