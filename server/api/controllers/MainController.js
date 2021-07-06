import { Router } from 'express'

export default function mainRoutes (mainService, logger) {
  const router = new Router()
  const controller = new MainController(mainService, logger)
  router.post('/newItem', async (req, res) => await controller.newItem(req, res))
  router.post('/updateItem', async (req, res) => await controller.updateItem(req, res))
  router.delete('/deleteItem/:id', async (req, res) => await controller.deleteItem(req, res))
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
      console.log('controller new item', req.body)
      const result = await this.mainService.newItem(req.body)
      res.status(200).json(result)
    }
    catch (ex) {
      this.logError(ex, res)
    }
  }

  async updateItem (req, res) {
    try {
      const success = await this.mainService.updateItem(req.body)
      res.status(200).json(success)
    }
    catch (ex) {
      this.logError(ex, res)
    }
  }

  async deleteItem (req, res) {
    await this.doStuff(res, async () => {
      return await this.mainService.deleteItem(req.params.id)
    })
  }

  async doStuff (res, stuff) {
    try {
      res.status(200).json(await stuff())
    }
    catch (ex) {
      this.logError(ex, res)
    }
  }
}
