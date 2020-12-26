import { Router } from 'express'

export default function adminBellScheduleRoutes (bellScheduleService, logger) {
  const router = new Router()
  const controller = new AdminBellScheduleRoutes(bellScheduleService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getList(req, res))
  router.post('/', async (req, res) => await controller.updateBellSchedule(req, res))
  router.post('/clear', async (req, res) => await controller.clearBellSchedule(req, res))
  return router
}

class AdminBellScheduleRoutes {
  constructor (bellScheduleService, logger) {
    this.bellScheduleService = bellScheduleService
    this.logger = logger
  }

  async getList (req, res) {
    try {
      const results = await this.bellScheduleService.getBellSchedule()
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

  async updateBellSchedule (req, res) {
    try {
      const results = await this.bellScheduleService.setBellSchedule(req.body.periodId, req.body.dayOfWeek, req.body.startTime, req.body.endTime)
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

  async clearBellSchedule (req, res) {
    try {
      const results = await this.bellScheduleService.clearBellSchedule(req.body.periodId, req.body.dayOfWeek)
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
