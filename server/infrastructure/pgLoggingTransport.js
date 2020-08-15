import * as os from 'os'
import Transport from 'winston-transport'

export default class PgLoggingTransport extends Transport {
  constructor (options = {}) {
    super(options)

    this.name = options.name || 'Postgres'
    //
    // Set the level from your options
    //
    this.level = options.level || 'info'

    this.silent = options.silent || false
    this.pgPool = options.pgPool
  }

  log (args, callback) {
    const { level, message, meta } = args

    if (!callback) {
      callback = () => {}
    }

    if (this.silent) {
      callback(null, true)
      return null
    }

    // function logging.addLog(nodeLevel varchar(10), message text, host text, pid integer, meta json)
    const params = [level, message, os.hostname(), process.pid, meta || {}]
    return this.pgPool.connect().then(client => client
      .query('select logging.addLog($1, $2, $3, $4, $5) as id;', params)
      .then(() => {
        client.release()
        this.emit('logged', args)
        callback(null, true)
        return null
      })
      .catch((e) => {
        client.release()
        this.emit('error', e.stack)
        callback(e.stack)
        return null
      }))
  }
}
