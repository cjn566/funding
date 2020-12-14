
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

  async saveTimePeriod (data) {
    const { id, name, isActive } = data
    if (id != null) {
      await this.timePeriodRepo.update(id, name, isActive)
    }
    else {
      await this.timePeriodRepo.add(name)
    }
  }

  async addStudentToPeriod (periodName, studentKeyId) {
    await this.timePeriodRepo.addStudentToPeriod(periodName, studentKeyId)
  }

  async deleteStudentFromPeriod (periodName, studentKeyId) {
    await this.timePeriodRepo.deleteStudentFromPeriod(periodName, studentKeyId)
  }
}
