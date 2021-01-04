import { Router } from 'express'
import { CheckJwt } from '../../../utils/auth'

export default function adminBellScheduleRoutes (bellScheduleService, logger) {
  const router = new Router()
  const controller = new AdminBellScheduleRoutes(bellScheduleService, logger)

  // admin functionality
  router.get('/', CheckJwt, async (req, res) => await controller.getList(req, res))
  router.post('/', CheckJwt, async (req, res) => await controller.updateBellSchedule(req, res))
  router.post('/clear', CheckJwt, async (req, res) => await controller.clearBellSchedule(req, res))
  router.post('/:id/clear', CheckJwt, async (req, res) => await controller.clearBellScheduleForPeriod(req, res))
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

  async clearBellScheduleForPeriod (req, res) {
    try {
      const { id } = req.params
      const promises = []
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Sun'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Mon'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Tue'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Wed'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Thur'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Fri'))
      promises.push(await this.bellScheduleService.clearBellSchedule(id, 'Sat'))

      await Promise.all(promises).then(() => {
        res.status(200).json()
      })
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
