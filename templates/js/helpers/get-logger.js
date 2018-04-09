/* istanbul ignore file */

const { red, green, yellow, grey } = require('colors');
const { format, createLogger, transports } = require('winston');

const { splat, label, printf, combine, timestamp } = format;

function getColor(level) {
  switch (level) {
    case 'warn':
      return yellow;
    case 'error':
      return red;
    case 'debug':
      return grey;
    default:
      return green;
  }
}

function myFormat(...args) {
  return printf(info => {
    const color = getColor(info.level);
    const coloredPrefix = color(`[${info.timestamp}] [${info.level}] ${info.label} -`);

    return `${coloredPrefix} ${info.message} ${args.join(',')}`;
  });
}

function getLogger(filename, ...args) {
  return createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : null,
    format: combine(timestamp(), label({ label: filename }), splat(), myFormat(...args)),
    transports: [new transports.Console({ colorize: true })]
  });
}

module.exports = getLogger;
