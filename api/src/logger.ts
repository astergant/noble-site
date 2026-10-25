/**
 * Minimal structured logger. Never pass lead payloads here: names, phones and
 * comments are personal data and must not end up in logs.
 */
type Level = 'info' | 'warn' | 'error';

function write(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...meta });
  if (level === 'error') console.error(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => write('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write('warn', msg, meta),
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) =>
    write('error', msg, { ...meta, error: err instanceof Error ? err.message : String(err) }),
};
