export enum LogLevel { NONE = 0, ERROR = 1, WARN = 2, INFO = 3 }

const serialize = (a: unknown): string => {
  try { return typeof a === "string" ? a : JSON.stringify(a); } catch { return String(a); }
};

class Logger {
  private static instance: Logger;
  private level: LogLevel;

  private constructor() {
    const raw = import.meta.env.VITE_LOG_LEVEL;
    const parsed = parseInt(raw ?? "3", 10);
    this.level = isNaN(parsed) || parsed < 0 || parsed > 3 ? LogLevel.INFO : (parsed as LogLevel);
  }

  static getInstance(): Logger {
    Logger.instance ??= new Logger();
    return Logger.instance;
  }

  error(...args: unknown[]): void {
    if (this.level >= LogLevel.ERROR) console.error("[ERROR]", ...args.map(serialize));
  }
  warn(...args: unknown[]): void {
    if (this.level >= LogLevel.WARN) console.warn("[WARN]", ...args.map(serialize));
  }
  info(...args: unknown[]): void {
    if (this.level >= LogLevel.INFO) console.info("[INFO]", ...args.map(serialize));
  }
  setLevel(l: LogLevel): void { this.level = l; }
  getLevel(): LogLevel { return this.level; }
}

export const logger = Logger.getInstance();
