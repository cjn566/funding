import BaseRepo from './BaseRepo'

export default class TimePeriodRepo extends BaseRepo {
  async getStudentsForPeriod (periodName) {
    const params = [periodName]
    const results = await this.withClient(client => client.query(
      `select * from student.studentTimePeriod stp
      inner join student.student ss on stp.studentId = ss.id and stp.periodName = $1 order by ss.name`, params))
    return results.rows
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from lookup.timePeriod'))
    return results.rows
  }

  async add (name) {
    const params = [name]
    await this.withClient(client => client.query(
      'insert into lookup.timePeriod(periodName) values ($1)', params))
  }

  async addStudentToPeriod (periodName, studentKeyId) {
    const params = [periodName, studentKeyId]
    await this.withClient(client => client.query(
      'insert into student.studentTimePeriod (periodName, studentId) values ($1, (select id from student.student where keyid = $2))', params))
  }

  async deleteStudentFromPeriod (periodName, studentKeyId) {
    const params = [periodName, studentKeyId]
    await this.withClient(client => client.query(
      'delete from student.studentTimePeriod where periodName = $1 and studentId = $2', params))
  }
}
