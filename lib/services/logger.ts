export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error | string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class Logger {
  private minLevel: LogLevel = (process.env.LOG_LEVEL || 'info') as LogLevel

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase()
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
    const errorStr = entry.error ? ` | ERROR: ${entry.error}` : ''

    return `[${timestamp}] [${level}]${contextStr} ${entry.message}${errorStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel]
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | string, context?: Record<string, any>) {
    this.log('error', message, context, error)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error | string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    }

    const formatted = this.formatMessage(entry)

    if (level === 'error') {
      console.error(formatted)
    } else if (level === 'warn') {
      console.warn(formatted)
    } else {
      console.log(formatted)
    }
  }
}

export const logger = new Logger()
