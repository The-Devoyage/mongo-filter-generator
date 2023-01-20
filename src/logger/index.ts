import pino from "pino";
import { Level } from "pino";

export const startLogger = (args: { level?: Level }) => {
  console.log(`Setting log level: ${args.level ?? "info"}`);

  return pino({
    transport: {
      target: "pino-pretty",
    },
    level: args.level ?? "info",
  });
};
