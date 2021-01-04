import { Router } from 'express'
import { CheckJwt } from '../../../utils/auth'
const formidable = require('formidable')
const csv = require('csvtojson')

export default function adminTimePeriodRoutes (timePeriodService, logger) {
  const router = new Router()
  const controller = new AdminTimePeriodController(timePeriodService, logger)

  // admin functionality
  router.get('/', CheckJwt, async (req, res) => await controller.getList(req, res))
  router.get('/students', CheckJwt, async (req, res) => await controller.getListWithStudents(req, res))
  router.get('/:periodId/students', CheckJwt, async (req, res) => await controller.getStudentsForPeriod(req, res))
  router.post('/:periodId/deactivate', CheckJwt, async (req, res) => await controller.deactivateTimePeriod(req, res))
  router.post('/', CheckJwt, async (req, res) => await controller.saveTimePeriod(req, res))
  router.post('/:periodId/batchAdd', CheckJwt, async (req, res) => await controller.batchAddStudents(req, res, false))
  router.post('/:periodId/batchReplace', CheckJwt, async (req, res) => await controller.batchAddStudents(req, res, true))
  router.post('/:periodId/:studentId', CheckJwt, async (req, res) => await controller.addStudentToPeriod(req, res))
  router.delete('/:periodId/:studentId', CheckJwt, async (req, res) => await controller.deleteStudentFromPeriod(req, res))
  return router
}

class AdminTimePeriodController {
  constructor (timePeriodService, studentService, logger) {
    this.timePeriodService = timePeriodService
    this.studentService = studentService
    this.logger = logger
  }

  async deactivateTimePeriod (req, res) {
    try {
      await this.timePeriodService.deactivateTimePeriod(req.params.periodId)
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

  async batchAddStudents (req, res, replaceAll) {
    try {
      const form = new formidable.IncomingForm()
      const periodId = req.params.periodId

      await form.parse(req, async (err, fields, files) => {
        if (err && err.length > 0) {
          this.logger.error(`Exception - ${err}`)
        }
        const jsonObj = await csv().fromFile(files.file.path)

        const students = jsonObj.map((student) => {
          return {
            key: student.student_id.trim(),
            first: student.first_name.trim(),
            last: student.last_name.trim()
          }
        })

        let failMessages = await this.studentService.batchCreateStudents(students, true)

        if (failMessages.length === 0) {
          failMessages = await this.timePeriodService.batchAddStudents(periodId, students, replaceAll)
        }

        const ret = {
          success: failMessages.length === 0,
          failMessages
        }

        res.status(200).send(ret)
      })
    }
    catch (ex) {
      this.logger.error(`Error in matchController.processBatchCreate - ${ex.message}, stack trace - ${ex.stack}`)
      ex.logged = true
      res.status(500).send(ex)
    }
  }

  async deleteStudentFromPeriod (req, res) {
    try {
      await this.timePeriodService.deleteStudentFromPeriod(req.params.periodId, req.params.studentId)
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
      await this.timePeriodService.addStudentToPeriodById(req.params.periodId, req.params.studentId)
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
          id: x.id,
          name: x.period_name,
          students: (await this.timePeriodService.getStudentsForPeriod(x.id)).map((x) => {
            return {
              id: x.id,
              key: x.key_id,
              firstName: x.first_name,
              lastName: x.last_name
            }
          })
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

  async getStudentsForPeriod (req, res) {
    try {
      const periodId = req.params.periodId
      const results = (await this.timePeriodService.getStudentsForPeriod(periodId)).map((x) => {
        return {
          id: x.id,
          key: x.key_id,
          firstName: x.first_name,
          lastName: x.last_name
        }
      })

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
      const data = await this.timePeriodService.getList()
      const results = data.map((x) => {
        return {
          id: x.id,
          isActive: x.is_active,
          periodName: x.period_name,
          studentCount: x.cnt
        }
      })
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

  async saveTimePeriod (req, res) {
    try {
      const results = await this.timePeriodService.saveTimePeriod(req.body)
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
