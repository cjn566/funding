import { Router } from 'express'

export default function adminStudentRoutes (studentService, logger) {
  const router = new Router()
  const controller = new AdminStudentController(studentService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getList(req, res))
  router.post('/', async (req, res) => await controller.saveStudent(req, res))
  return router
}

class AdminStudentController {
  constructor (studentService, logger) {
    this.studentService = studentService
    this.logger = logger
  }

  async getList (req, res) {
    try {
      const data = await this.studentService.getList()
      const results = data.map((x) => {
        return {
          id: x.id,
          name: x.name,
          key: x.key_id,
          isActive: x
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
      const { id, name, key } = req.body
      const success = await this.studentService.saveStudent(id, name, key)
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
