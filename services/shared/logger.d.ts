/**
 * Shared Logger Module
 *
 * This module provides a standardized logging interface for all services.
 * It supports different log levels and formats based on the environment.
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    SUCCESS = "success"
}
/**
 * Interface for log context
 */
export interface LogContext {
    [key: string]: any;
}
/**
 * Logger configuration options
 */
export interface LoggerOptions {
    serviceName: string;
    environment?: string;
    minLevel?: LogLevel;
}
/**
 * Logger class
 */
export declare class Logger {
    private options;
    /**
     * Create a new logger
     *
     * @param options - Logger options
     */
    constructor(options?: Partial<LoggerOptions>);
    /**
     * Format a log message
     *
     * @param level - Log level
     * @param message - Log message
     * @param context - Log context
     * @returns Formatted log message
     */
    private formatLog;
    /**
     * Check if a log level should be displayed
     *
     * @param level - Log level to check
     * @returns Whether the log level should be displayed
     */
    private shouldLog;
    /**
     * Log an error message
     *
     * @param message - Error message
     * @param context - Error context
     */
    error(message: string, context?: LogContext): void;
    /**
     * Log a warning message
     *
     * @param message - Warning message
     * @param context - Warning context
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log an info message
     *
     * @param message - Info message
     * @param context - Info context
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log a success message
     *
     * @param message - Success message
     * @param context - Success context
     */
    success(message: string, context?: LogContext): void;
    /**
     * Log a debug message
     *
     * @param message - Debug message
     * @param context - Debug context
     */
    debug(message: string, context?: LogContext): void;
}
/**
 * Create a default logger instance
 */
export declare const logger: Logger;
