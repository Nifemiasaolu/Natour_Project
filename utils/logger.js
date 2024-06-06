const { createLogger, format, transports } = require("winston");

const { cli } = format;

const logger = createLogger({
  level: "info",
  format: cli(),
  transports: [new transports.Console()],
});

module.exports = logger;
