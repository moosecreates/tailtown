"use strict";
/**
 * Shared Logger Module
 *
 * This module provides a standardized logging interface for all services.
 * It supports different log levels and formats based on the environment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["SUCCESS"] = "success";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Default logger options
 */
const defaultOptions = {
    serviceName: 'tailtown-service',
    environment: process.env.NODE_ENV || 'development',
    minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
};
/**
 * Logger class
 */
class Logger {
    options;
    /**
     * Create a new logger
     *
     * @param options - Logger options
     */
    constructor(options = {}) {
        this.options = { ...defaultOptions, ...options };
    }
    /**
     * Format a log message
     *
     * @param level - Log level
     * @param message - Log message
     * @param context - Log context
     * @returns Formatted log message
     */
    formatLog(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${this.options.serviceName}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }
    /**
     * Check if a log level should be displayed
     *
     * @param level - Log level to check
     * @returns Whether the log level should be displayed
     */
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.SUCCESS, LogLevel.DEBUG];
        const minLevelIndex = levels.indexOf(this.options.minLevel || LogLevel.INFO);
        const currentLevelIndex = levels.indexOf(level);
        return currentLevelIndex <= minLevelIndex;
    }
    /**
     * Log an error message
     *
     * @param message - Error message
     * @param context - Error context
     */
    error(message, context) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.formatLog(LogLevel.ERROR, message, context));
        }
    }
    /**
     * Log a warning message
     *
     * @param message - Warning message
     * @param context - Warning context
     */
    warn(message, context) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatLog(LogLevel.WARN, message, context));
        }
    }
    /**
     * Log an info message
     *
     * @param message - Info message
     * @param context - Info context
     */
    info(message, context) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatLog(LogLevel.INFO, message, context));
        }
    }
    /**
     * Log a success message
     *
     * @param message - Success message
     * @param context - Success context
     */
    success(message, context) {
        if (this.shouldLog(LogLevel.SUCCESS)) {
            console.info(this.formatLog(LogLevel.SUCCESS, message, context));
        }
    }
    /**
     * Log a debug message
     *
     * @param message - Debug message
     * @param context - Debug context
     */
    debug(message, context) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.formatLog(LogLevel.DEBUG, message, context));
        }
    }
}
exports.Logger = Logger;
/**
 * Create a default logger instance
 */
exports.logger = new Logger();
