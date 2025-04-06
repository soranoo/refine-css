/**
 * Logger interface options
 */
export interface LoggerOptions {
	/** Whether to save logs to a file */
	saveToFile?: boolean;
	/** Path to the log file */
	logFilePath?: string;
	/** Whether to include timestamp in logs */
	includeTimestamp?: boolean;
	/** Whether to log to console */
	silent?: boolean;
}

/**
 * Log levels with their corresponding emojis
 */
export type LogLevel = "info" | "warn" | "error" | "debug" | "success";

const LOG_EMOJIS: Record<LogLevel, string> = {
	info: "📝",
	warn: "⚠️",
	error: "❌",
	debug: "🔍",
	success: "✅",
};

/**
 * Logger class with emoji support and optional file saving.
 *
 * @example
 * ```ts
 * // Create a simple console logger
 * const logger = new Logger();
 * logger.info("This is an info message");  // 📝 This is an info message
 *
 * // Create a logger that saves to file
 * const fileLogger = new Logger({
 *   saveToFile: true,
 *   logFilePath: "./logs/app.log"
 * });
 * fileLogger.error("Something went wrong"); // Logs to console and file
 * ```
 */
export class Logger {
	private saveToFile: boolean;
	private logFilePath: string;
	private includeTimestamp: boolean;
	private silent: boolean;

	constructor(options: LoggerOptions = {}) {
		this.saveToFile = options.saveToFile ?? false;
		this.logFilePath = options.logFilePath ?? "./logs.txt";
		this.includeTimestamp = options.includeTimestamp ?? true;
		this.silent = options.silent ?? false;
	}

	/**
	 * Log a message with info level
	 */
	async info(message: string, ...data: unknown[]): Promise<void> {
		return this.log("info", message, ...data);
	}

	/**
	 * Log a message with warn level
	 */
	async warn(message: string, ...data: unknown[]): Promise<void> {
		return this.log("warn", message, ...data);
	}

	/**
	 * Log a message with error level
	 */
	async error(message: string, ...data: unknown[]): Promise<void> {
		return this.log("error", message, ...data);
	}

	/**
	 * Log a message with debug level
	 */
	async debug(message: string, ...data: unknown[]): Promise<void> {
		return this.log("debug", message, ...data);
	}

	/**
	 * Log a message with success level
	 */
	async success(message: string, ...data: unknown[]): Promise<void> {
		return this.log("success", message, ...data);
	}

	/**
	 * Log a message with the specified level and emoji
	 *
	 * @param level - The log level
	 * @param message - The message to log
	 * @param data - Optional data to log
	 */
	async log(
		level: LogLevel,
		message: string,
		...data: unknown[]
	): Promise<void> {
		const emoji = LOG_EMOJIS[level] || "🔹";

		// Format the log entry
		let logEntry = `${emoji} ${message}`;

		// Add timestamp if requested
		if (this.includeTimestamp) {
			const timestamp = new Date().toISOString();
			logEntry = `[${timestamp}] ${logEntry}`;
		}

		// Log to console if not silent
		if (!this.silent) {
			switch (level) {
				case "error":
					console.error(logEntry, ...data);
					break;
				case "warn":
					console.warn(logEntry, ...data);
					break;
				case "debug":
					console.debug(logEntry, ...data);
					break;
				default:
					console.log(logEntry, ...data);
			}
		}

		// Save to file if requested
		if (this.saveToFile) {
			try {
				// Format data for file logging
				const dataString = data.length
					? "\n" +
						data.map((d) =>
							typeof d === "object" ? JSON.stringify(d, null, 2) : String(d)
						).join("\n")
					: "";

				const fileContent = `${logEntry}${dataString}\n`;

				// Use Deno's API to write to file
				await Deno.writeTextFile(this.logFilePath, fileContent, {
					append: true,
				});
			} catch (error) {
				// Don't use the logger here to avoid recursion
				console.error(
					`❌ Failed to write to log file: ${
						error instanceof Error ? error.message : String(error)
					}`,
				);
			}
		}
	}
}
