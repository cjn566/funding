
export default class TimePeriodService {
  constructor (timePeriodRepo, logger) {
    this.timePeriodRepo = timePeriodRepo
    this.logger = logger
  }

  async getStudentsForPeriod (periodId) {
    return await this.timePeriodRepo.getStudentsForPeriod(periodId)
  }

  async getList () {
    const list = await this.timePeriodRepo.getList()
    return list
  }

  async add (data) {
    const { name, start, end } = data
    await this.timePeriodRepo.add(name, start, end)
  }

  async addStudentToPeriod (periodId, studentKeyId) {
    await this.timePeriodRepo.addStudentToPeriod(periodId, studentKeyId)
  }

  async deleteStudentFromPeriod (periodId, studentKeyId) {
    await this.timePeriodRepo.deleteStudentFromPeriod(periodId, studentKeyId)
  }
}
