const { createLogger, format, transports, config } = require('winston')

if (!process.env.LOG_FORMAT || process.env.LOG_FORMAT !== 'pretty') {
    process.env.LOG_FORMAT = 'json'
}

let formats = []
if (process.env.LOG_SUPPRESS)
    formats.push(format.silent())
if (process.env.LOG_FORMAT === 'pretty') {
    formats.push(format.colorize())
    formats.push(format.prettyPrint())
} else {
    formats.push(format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }))
    formats.push(format.json())
}

let recommendLevel = function () {
    if (process.env.LOG_LEVEL &&
        Object.keys(config.syslog.levels).includes(process.env.LOG_LEVEL)) {
        return process.env.LOG_LEVEL;
    } else if (process.env.NODE_ENV === 'development') {
        return 'debug';
    } else {
        return 'info';
    }
}

const logger = createLogger({
    level: recommendLevel(),
    format: format.combine(...formats),
    defaultMeta: { service: 'eventsArchive' },
    transports: [
        new transports.File({ filename: 'log/error.log', level: 'error' }),
        new transports.File({ filename: 'log/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

module.exports = logger