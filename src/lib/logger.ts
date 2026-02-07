/**
 * Development-only logger utility
 *
 * In production, these methods do nothing, preventing sensitive data from being logged.
 * In development, they work exactly like console methods.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.log('User data:', user);
 *   logger.error('Failed to fetch:', error);
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

class Logger {
  /**
   * Log informational messages (only in development)
   */
  log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log error messages (only in development)
   */
  error(...args: any[]): void {
    if (isDevelopment) {
      console.error(...args);
    }
  }

  /**
   * Log warning messages (only in development)
   */
  warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log info messages (only in development)
   */
  info(...args: any[]): void {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Always log critical errors, even in production
   * Use sparingly and ensure no sensitive data is included
   */
  critical(...args: any[]): void {
    console.error('[CRITICAL]', ...args);
  }
}

export const logger = new Logger();
