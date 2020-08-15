import { Router } from 'express'

export default function adminTimePeriodRoutes (timePeriodService, logger) {
  const router = new Router()
  const controller = new AdminTimePeriodController(timePeriodService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getList(req, res))
  router.post('/', async (req, res) => await controller.add(req, res))
  return router
}

class AdminTimePeriodController {
  constructor (timePeriodService, logger) {
    this.timePeriodService = timePeriodService
    this.logger = logger
  }

  async getList (req, res) {
    try {
      const results = await this.timePeriodService.getList()
      res.status(200).json(results)
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async add (req, res) {
    try {
      const results = await this.timePeriodService.add(req.body)
      res.status(200).json(results)
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }
}
