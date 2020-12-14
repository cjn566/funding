import { Router } from 'express'

export default function adminUserRoutes (userService, logger) {
  const router = new Router()
  const controller = new AdminUserController(userService, logger)

  // admin functionality
  router.get('/', async (req, res) => await controller.getUserList(req, res))
  router.post('/', async (req, res) => await controller.saveUser(req, res))
  router.patch('/:id/disable', async (req, res) => await controller.changeUserState(req, res, false))
  router.patch('/:id/enable', async (req, res) => await controller.changeUserState(req, res, true))
  router.patch('/:id/password', async (req, res) => await controller.changePassword(req, res))
  return router
}

class AdminUserController {
  constructor (userService, logger) {
    this.userService = userService
    this.logger = logger
  }

  async changePassword (req, res, isActive) {
    try {
      const { password } = req.body
      await this.userService.changeUserPassword(req.params.id, password)
      res.status(200).json()
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }


  async changeUserState (req, res, isActive) {
    try {
      await this.userService.changeUserState(req.params.id, isActive)
      res.status(200).json()
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

  async saveUser (req, res) {
    try {
      let ret = null
      const { id, email, first, last, password } = req.body
      if (id) {
        ret = await this.userService.updateUser(id, email, first, last)
      }
      else {
        ret = await this.userService.addUser(email, first, last, password)
      }
      res.status(200).json(ret)
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
