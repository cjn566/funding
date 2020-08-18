import BaseRepo from './BaseRepo'

export default class TimePeriodRepo extends BaseRepo {
  async getStudentsForPeriod (periodId) {
    const params = [periodId]
    const results = await this.withClient(client => client.query(
      `select * from student.studentTimePeriod stp
      inner join student.student ss on stp.studentId = ss.id and stp.timePeriodId = $1 order by ss.name`, params))
    return results.rows
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from admin.timePeriod'))
    return results.rows
  }

  async add (name, start, stop) {
    const params = [name, start, stop]
    await this.withClient(client => client.query(
      'insert into admin.timePeriod(periodName, startTime, endTime) values ($1, $2, $3)', params))
  }

  async addStudentToPeriod (periodId, studentKeyId) {
    const params = [periodId, studentKeyId]
    await this.withClient(client => client.query(
      'insert into student.studentTimePeriod (timePeriodId, isActive, studentId) values ($1, true, (select id from student.student where keyid = $2))', params))
  }

  async deleteStudentFromPeriod (periodId, studentKeyId) {
    const params = [periodId, studentKeyId]
    await this.withClient(client => client.query(
      'delete from student.studentTimePeriod where timePeriodId = $1 and studentId = $2', params))
  }
}
