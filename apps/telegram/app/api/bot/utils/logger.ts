import { createLogger, format, Logger, transports } from "winston";

import { env } from "~/env";
import { bot } from "./bot";

export const logger: Logger = createLogger({
  level: env.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        format.printf(
          (info) =>
            `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}` +
            (info.splat !== undefined ? `${info.splat}` : " "),
        ),
      ),
    }),

    new transports.File({
      filename: "logs.log",
      format: format.combine(
        format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        format.printf(
          (info) =>
            `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}` +
            (info.splat !== undefined ? `${info.splat}` : " "),
        ),
      ),
    }),
  ],

  exitOnError: false,
});

export async function channel_log(log: string) {
  try {
    if (env.LOG_CHANNEL) {
      if (log.length >= 4096) {
        log = log.substring(0, 4096);
      }
      await bot.api.sendMessage(env.LOG_CHANNEL, log, {
        parse_mode: "HTML",
      });
    }
  } catch (err) {
    logger.error("Failed to post message on LOG_CHANNEL: ", err);
  }
}

export async function grammyErrorLog(ctx: any, GrammyError: any) {
  logger.error(`${GrammyError}`);
  channel_log(
    `${GrammyError}\n\n` +
      `Timestamp: ${new Date().toLocaleString()}\n\n` +
      `Update object:\n${JSON.stringify(ctx.update, null, 2)}`,
  );
}
