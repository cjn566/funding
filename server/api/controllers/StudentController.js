import { Router } from 'express'

export default function studentRoutes (studentService, logger) {
  const router = new Router()
  const controller = new StudentController(studentService, logger)

  router.get('/:key',async (req, res) => await controller.studentAccess(req, res))

  return router
}

class StudentController {
  constructor (studentService, logger) {
    this.studentService = studentService
    this.logger = logger
  }

  async studentAccess (req, res) {
    try {
      const results = await this.studentService.checkAccess(req.params.key)
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
