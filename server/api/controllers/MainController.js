import { Router } from 'express'

export default function mainRoutes (mainService, logger) {
  const router = new Router()
  const controller = new MainController(mainService, logger)
  router.get('/newItem/:parentId', async (req, res) => await controller.newItem(req, res))
  router.get('/items', async (req, res) => await controller.getItems(req, res))
  return router
}

class MainController {
  constructor (mainService, logger) {
    this.mainService = mainService
    this.logger = logger
  }

  logError = (ex, res) => {
    if (!ex.logged) {
      this.logger.error(`[Exception] - ${ex.message}, [Location] - ${ex.where}, [Detail] - ${ex.detail}`)
      ex.logged = true
    }
    res.status(500).send(ex)
  }

  async getItems (req, res) {
    try {
      const results = await this.mainService.getFullTree()
      res.status(200).json(results)
    }
    catch (ex) {
      this.logError(ex, res)
    }
  }

  async newItem (req, res) {
    try {
      const success = await this.mainService.newItem(req.params.parentId)
      res.status(200).json(success)
    }
    catch (ex) {
      this.logError(ex, res)
    }
  }
}
