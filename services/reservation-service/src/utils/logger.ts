/**
 * Logger Utility
 * 
 * This module provides a consistent logging interface for the application.
 * It can be configured to output logs to different destinations based on environment.
 */

// Simple logger implementation that can be replaced with a more robust solution like Winston if needed
export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  
  error: (message: string) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  },
  
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
  
  debug: (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  }
};
