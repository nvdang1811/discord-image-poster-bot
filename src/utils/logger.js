import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor(level = 'INFO') {
    this.level = logLevels[level.toUpperCase()] || logLevels.INFO;
    this.logFile = path.join(logsDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ') : '';
    return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message, ...args) {
    if (this.level >= logLevels.ERROR) {
      const formatted = this.formatMessage('ERROR', message, ...args);
      console.error(formatted);
      this.writeToFile(formatted);
    }
  }

  warn(message, ...args) {
    if (this.level >= logLevels.WARN) {
      const formatted = this.formatMessage('WARN', message, ...args);
      console.warn(formatted);
      this.writeToFile(formatted);
    }
  }

  info(message, ...args) {
    if (this.level >= logLevels.INFO) {
      const formatted = this.formatMessage('INFO', message, ...args);
      console.log(formatted);
      this.writeToFile(formatted);
    }
  }

  debug(message, ...args) {
    if (this.level >= logLevels.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, ...args);
      console.log(formatted);
      this.writeToFile(formatted);
    }
  }
}

// Create and export a singleton instance
export const logger = new Logger(process.env.LOG_LEVEL || 'INFO');
