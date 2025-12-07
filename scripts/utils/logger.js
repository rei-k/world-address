/**
 * Logger utility for consistent logging across scripts
 * Provides colored output and different log levels
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '';
    this.enableColors = options.enableColors !== false;
    this.logLevel = options.logLevel || 'info';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
  }

  _colorize(text, color) {
    if (!this.enableColors) {
      return text;
    }
    return `${color}${text}${COLORS.reset}`;
  }

  _shouldLog(level) {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  _log(level, message, color) {
    if (!this._shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelTag = `[${level.toUpperCase()}]`;
    const prefix = this.prefix ? `[${this.prefix}]` : '';

    console.log(
      this._colorize(`${timestamp} ${levelTag}${prefix}`, COLORS.dim),
      this._colorize(message, color)
    );
  }

  debug(message) {
    this._log('debug', message, COLORS.cyan);
  }

  info(message) {
    this._log('info', message, COLORS.blue);
  }

  success(message) {
    this._log('info', `✓ ${message}`, COLORS.green);
  }

  warn(message) {
    this._log('warn', `⚠ ${message}`, COLORS.yellow);
  }

  error(message) {
    this._log('error', `✗ ${message}`, COLORS.red);
  }

  progress(current, total, item = '') {
    if (!this._shouldLog('info')) {
      return;
    }
    const percentage = ((current / total) * 100).toFixed(1);
    const bar = this._createProgressBar(current, total);
    const message = `${bar} ${percentage}% (${current}/${total})${item ? ` - ${item}` : ''}`;
    process.stdout.write(`\r${message}`);
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  _createProgressBar(current, total, width = 30) {
    const filled = Math.floor((current / total) * width);
    const empty = width - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }

  section(title) {
    if (!this._shouldLog('info')) {
      return;
    }
    const separator = '='.repeat(60);
    console.log(this._colorize(`\n${separator}`, COLORS.bright));
    console.log(this._colorize(title, COLORS.bright));
    console.log(this._colorize(separator, COLORS.bright));
  }
}

/**
 * Create a new logger instance
 */
function createLogger(options) {
  return new Logger(options);
}

module.exports = { Logger, createLogger, COLORS };
