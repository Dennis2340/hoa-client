/**
 * Simple logger utility for GovVerify Agent
 * Provides structured logging with context
 */

const logger = {
  info: (context, message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message, JSON.stringify(context, null, 2));
  },

  error: (context, message) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, message, JSON.stringify(context, null, 2));
  },

  warn: (context, message) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN:`, message, JSON.stringify(context, null, 2));
  },

  debug: (context, message) => {
    const timestamp = new Date().toISOString();
    if (process.env.DEBUG === 'true') {
      console.debug(`[${timestamp}] DEBUG:`, message, JSON.stringify(context, null, 2));
    }
  }
};

module.exports = { logger };
