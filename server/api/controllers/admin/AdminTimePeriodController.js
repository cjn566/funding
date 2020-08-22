import { Router } from 'express'

export default function adminTimePeriodRoutes (timePeriodService, logger) {
  const router = new Router()
  const controller = new AdminTimePeriodController(timePeriodService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getList(req, res))
  router.get('/students', async (req, res) => await controller.getListWithStudents(req, res))
  router.post('/', async (req, res) => await controller.add(req, res))
  router.post('/:periodId/:studentKeyId', async (req, res) => await controller.addStudentToPeriod(req, res))
  router.delete('/:periodId/:studentKeyId', async (req, res) => await controller.deleteStudentFromPeriod(req, res))
  return router
}

class AdminTimePeriodController {
  constructor (timePeriodService, logger) {
    this.timePeriodService = timePeriodService
    this.logger = logger
  }

  async deleteStudentFromPeriod (req, res) {
    try {
      await this.timePeriodService.deleteStudentFromPeriod(req.params.periodId, req.params.studentKeyId)
      res.status(200).send()
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async addStudentToPeriod (req, res) {
    try {
      await this.timePeriodService.addStudentToPeriod(req.params.periodId, req.params.studentKeyId)
      res.status(200).send()
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async getListWithStudents (req, res) {
    try {
      const periods = await this.timePeriodService.getList()
      const results = await Promise.all(periods.map(async (x) => {
        return {
          period: x,
          students: await this.timePeriodService.getStudentsForPeriod(x.periodname)
        }
      }))
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
