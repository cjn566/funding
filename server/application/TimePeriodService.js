
export default class TimePeriodService {
  constructor (timePeriodRepo, logger) {
    this.timePeriodRepo = timePeriodRepo
    this.logger = logger
  }

  async getStudentsForPeriod (periodName) {
    return await this.timePeriodRepo.getStudentsForPeriod(periodName)
  }

  async getList () {
    const list = await this.timePeriodRepo.getList()
    return list
  }

  async add (data) {
    const { name } = data
    await this.timePeriodRepo.add(name)
  }

  async addStudentToPeriod (periodName, studentKeyId) {
    await this.timePeriodRepo.addStudentToPeriod(periodName, studentKeyId)
  }

  async deleteStudentFromPeriod (periodName, studentKeyId) {
    await this.timePeriodRepo.deleteStudentFromPeriod(periodName, studentKeyId)
  }
}
