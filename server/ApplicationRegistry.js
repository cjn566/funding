// repositories
import MainRepo from './database/MainRepo'

// Services
import MainService from './application/MainService'

export default class ApplcationRegistry {
  constructor (dbPool, winstonLogger) {
    this.dbPool = dbPool
    this.winstonLogger = winstonLogger
  }

  createMainService () {
    const mainRepo = new MainRepo(this.dbPool, this.winstonLogger)
    const mainService = new MainService(mainRepo, this.winstonLogger)
    return mainService
  }
}
