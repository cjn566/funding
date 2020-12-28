import { Router } from 'express'
import { Parser } from 'json2csv'
const { DateTime } = require('luxon')

export default function adminReportRoutes (reportService, logger) {
  const router = new Router()
  const controller = new AdminReportController(reportService, logger)

  // admin functionality
  router.get('/live', async (req, res) => await controller.getLive(req, res))
  router.get('/history', async (req, res) => await controller.getHistorical(req, res))
  router.get('/history/csv', async (req, res) => await controller.getHistoricalCsv(req, res))
  return router
}

class AdminReportController {
  constructor (reportService, logger) {
    this.reportService = reportService
    this.logger = logger
  }

  async getLive (req, res) {
    try {
      const recordCount = req.params.recordCount || 20
      const results = await this.reportService.getLive(recordCount)
      const data = results.map((x) => {
        return {
          studentId: x.student_key,
          student: x.last_name == null ? null : (x.last_name + ', ' + x.first_name),
          success: x.success,
          dateTime: x.date_created
        }
      })
      res.status(200).json(data)
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async getHistorical (req, res) {
    try {
      const { start, end } = req.query
      // TODO: add in paging
      const results = await this.reportService.getHistorical(start, end, 1, 50000)

      const data = results.map((x) => {
        return {
          studentId: x.student_key,
          student: x.last_name == null ? null : (x.last_name + ', ' + x.first_name),
          success: x.success,
          dateTime: x.date_created
        }
      })
      res.status(200).json(data)
    }
    catch (ex) {
      if (!ex.logged) {
        this.logger.error(`Exception - ${ex.message}, stack trace - ${ex.stack}`)
        ex.logged = true
      }
      res.status(500).send(ex)
    }
  }

  async getHistoricalCsv (req, res) {
    try {
      const { start, end } = req.query
      // TODO: add in paging
      const results = await this.reportService.getHistorical(start, end, 1, 50000)

      let data = 'No Results'
      if (results.length > 0) {
        const records = results.map((x) => {
          return {
            studentId: x.student_key,
            student: x.last_name == null ? 'No Match' : (x.last_name + ', ' + x.first_name),
            success: x.success,
            scannedDateTime: formatForExport(x.date_created)
          }
        })

        const ps = new Parser()
        data = ps.parse(records)
      }

      res.setHeader('Content-disposition', 'attachment; filename=historyView.csv')
      res.set('Content-Type', 'text/csv')
      res.status(200).json(data)
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

function formatForExport (date) {
  console.log('dte', date)
  const dt = DateTime.fromISO(date.toString())
  console.log('dt', dt)
  const dteStr = dt.toLocaleString(DateTime.DATETIME_SHORT)
  return dteStr
}
