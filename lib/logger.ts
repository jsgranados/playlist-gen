type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function write(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    write("info", message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    write("warn", message, meta);
  },
  error(message: string, meta?: LogMeta) {
    write("error", message, meta);
  }
};
