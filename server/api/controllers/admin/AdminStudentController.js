import { Router } from 'express'

const formidable = require('formidable')
const csv = require('csvtojson')

export default function adminStudentRoutes (studentService, logger) {
  const router = new Router()
  const controller = new AdminStudentController(studentService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getList(req, res))
  router.get('/search/:term', async (req, res) => await controller.search(req, res))
  router.post('/', async (req, res) => await controller.saveStudent(req, res))
  router.post('/batch', async (req, res) => await controller.processBatch(req, res))
  router.patch('/:id/delete', async (req, res) => await controller.deleteStudent(req, res))
  return router
}

class AdminStudentController {
  constructor (studentService, logger) {
    this.studentService = studentService
    this.logger = logger
  }

  async search (req, res) {
    try {
      const results = (await this.studentService.search(req.params.term.toLowerCase())).map((x) => {
        return {
          id: x.id,
          firstName: x.first_name,
          lastName: x.last_name,
          key: x.key_id
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

  async processBatch (req, res) {
    try {
      const form = new formidable.IncomingForm()

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

        const failMessages = await this.studentService.batchCreateStudents(students)

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

  async getList (req, res) {
    try {
      const data = await this.studentService.getList()
      const results = data.map((x) => {
        return {
          id: x.id,
          firstName: x.first_name,
          lastName: x.last_name,
          key: x.key_id,
          isActive: x.is_active,
          periods: x.periods
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

  async saveStudent (req, res) {
    try {
      const { id, firstName, lastName, key, periods } = req.body
      const success = await this.studentService.saveStudent(id, firstName, lastName, key, periods)
      res.status(200).json(success)
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async deleteStudent (req, res) {
    try {
      const success = await this.studentService.deleteStudent(req.params.id)
      res.status(200).json(success)
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
