import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// Create a logger instance
const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined // pino-pretty is a dev dependency
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

export default logger;