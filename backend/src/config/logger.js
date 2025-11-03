const path = require('path')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, errors, colorize } = format

const logFolderPath = path.join(__dirname, '../../logs')
const errorLogPath = path.join(logFolderPath, 'error.log')
const appLogPath = path.join(logFolderPath, 'app.log')

const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
})

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                customFormat
            )
        }),
        new transports.File({
            filename: appLogPath,
            level: 'info'
        }),
        new transports.File({
            filename: errorLogPath,
            level: 'error'
        })
    ]
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combine(
            colorize(),
            customFormat
        )
    }))
}

module.exports = logger

