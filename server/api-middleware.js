import bodyParser from 'body-parser'
import express from 'express'
import winston from 'winston'
import keycardPool from './database/keycardPool'
import { addApiRoutes } from './routes'
import PgLoggingTransport from './infrastructure/pgLoggingTransport'

require('dotenv').config()

const path = '/api'
const app = express()
app.use(bodyParser.json())

const loggerTransports = [
  new PgLoggingTransport({
    pgPool: keycardPool,
    level: 'info'
  }),
  new winston.transports.Console({
    level: 'debug'
  })
]

const logger = winston.createLogger({
  transports: loggerTransports
})
addApiRoutes(app, keycardPool, logger)

process.on('exit', () => keycardPool.end())

module.exports = {
  path,
  handler: app
}
