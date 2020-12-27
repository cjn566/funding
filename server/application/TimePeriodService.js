
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
    const { id, name } = data
    if (id != null) {
      await this.timePeriodRepo.update(id, name, true)
    }
    else {
      await this.timePeriodRepo.add(name)
    }
  }

  async addStudentToPeriodById (periodId, studentKeyId) {
    await this.timePeriodRepo.addStudentToPeriodById(periodId, studentKeyId)
  }

  async deleteStudentFromPeriod (periodId, studentKeyId) {
    await this.timePeriodRepo.deleteStudentFromPeriod(periodId, studentKeyId)
  }

  async batchAddStudents (periodId, students, replaceAll) {
    if (replaceAll) {
      await this.timePeriodRepo.removeAllStudentsFromPeriod(periodId)
    }
    for (const student of students) {
      await this.timePeriodRepo.addStudentToPeriodByKey(periodId, student.student_id)
    }
    return []
  }
}
