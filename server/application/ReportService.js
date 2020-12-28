
export default class ReportService {
  constructor (reportRepo, logger) {
    this.reportRepo = reportRepo
    this.logger = logger
  }

  async getLive (recordCount) {
    return await this.reportRepo.getLive(recordCount || 20)
  }

  async getHistorical (start, end, currentPage, pageSize) {
    return await this.reportRepo.getHistorical(start, end, currentPage, pageSize)
  }
}
