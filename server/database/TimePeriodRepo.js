import BaseRepo from './BaseRepo'

export default class TimePeriodRepo extends BaseRepo {
  async getStudentsForPeriod (periodName) {
    const params = [periodName]
    const results = await this.withClient(client => client.query(
      `select * from student.student_time_period stp
      inner join student.student ss on stp.student_id = ss.id and stp.period_name = $1 order by ss.name`, params))
    return results.rows
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from lookup.time_period where is_active = true order by period_name'))
    return results.rows
  }

  async add (name) {
    const params = [name]
    await this.withClient(client => client.query(
      'insert into lookup.time_period(period_name) values ($1)', params))
  }

  async update (id, name, isActive) {
    const params = [id, name, isActive]
    await this.withClient(client => client.query(
      'update lookup.time_period set period_name = $2, is_active = $3 where id = $1', params))
  }

  async addStudentToPeriod (periodName, studentKeyId) {
    const params = [periodName, studentKeyId]
    await this.withClient(client => client.query(
      'insert into student.student_time_period (period_name, student_id) values ($1, (select id from student.student where key_id = $2))', params))
  }

  async deleteStudentFromPeriod (periodName, studentKeyId) {
    const params = [periodName, studentKeyId]
    await this.withClient(client => client.query(
      'delete from student.student_time_period where period_name = $1 and student_id = $2', params))
  }
}
