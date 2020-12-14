import { Router } from 'express'
const jwt = require('jsonwebtoken')

export default function authRoutes (userService, logger) {
  const router = new Router()
  const controller = new AuthController(userService, logger)

  // admin functionality
  router.post('/login', async (req, res) => await controller.login(req, res))
  router.post('/logout', async (req, res) => await controller.logout(req, res))
  return router
}

class AuthController {
  constructor (userService, logger) {
    this.userService = userService
    this.logger = logger
  }

  async login (req, res) {
    try {
      const ret = {
        token: null
      }
      const results = await this.userService.isLoginValid(req.body)
      // if valid, return a token
      if (results) {
        await this.userService.updateLogin(req.body.email)
        ret.success = true
        ret.token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET)
        res.status(200).json(ret)
      }
      else {
        ret.success = false
        ret.message = 'Invalid credentials'
        res.status(200).json(ret)
      }
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  logout (req, res) {
    try {
      res.status(200).json('')
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
