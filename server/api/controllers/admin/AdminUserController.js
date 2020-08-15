import { Router } from 'express'

export default function adminUserRoutes (userService, logger) {
  const router = new Router()
  const controller = new AdminUserController(userService, logger)

  // admin functionality
  router.post('/login', async (req, res) => await controller.checkLogin(req, res))
  router.get('/', async (req, res) => await controller.getUserList(req, res))
  router.post('/', async (req, res) => await controller.addUser(req, res))
  return router
}

class AdminUserController {
  constructor (userService, logger) {
    this.userService = userService
    this.logger = logger
  }

  async checkLogin (req, res) {
    try {
      const results = await this.userService.checkLogin(req.body)
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

  async getUserList (req, res) {
    try {
      const results = await this.userService.getUserList()
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

  async addUser (req, res) {
    try {
      const results = await this.userService.addUser(req.body)
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
