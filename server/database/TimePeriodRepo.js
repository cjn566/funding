import BaseRepo from './BaseRepo'

export default class TimePeriodRepo extends BaseRepo {
  async getStudentsForPeriod (periodId) {
    const params = [periodId]
    const results = await this.withClient(client => client.query(
      `select ss.id, ss.key_id, ss.first_name, ss.last_name
      from student.student_time_period sstp
      inner join student.student ss on sstp.student_id = ss.id and ss.is_active = true
      inner join lookup.time_period ltp on ltp.id = sstp.period_id and ltp.id =$1`, params))
    return results.rows
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select id, period_name, (select count(*) from student.student_time_period where period_id = ltp.id) as cnt from lookup.time_period ltp where is_active = true order by period_name'))
    return results.rows
  }

  async add (name) {
    const params = [name]
    await this.withClient(client => client.query(
      'insert into lookup.time_period(period_name) values ($1)', params))
  }

  async update (id, name) {
    const params = [id, name]
    await this.withClient(client => client.query(
      'update lookup.time_period set period_name = $2 where id = $1', params))
  }

  async deactivateTimePeriod (id) {
    const params = [id]
    await this.withClient(client => client.query(
      'update lookup.time_period set is_active = false where id = $1', params))
  }

  async addStudentToPeriodById (periodId, studentId) {
    const params = [periodId, studentId]
    await this.withClient(client => client.query(
      'insert into student.student_time_period (period_id, student_id) values ($1, $2) ON CONFLICT (period_id, student_id) DO NOTHING', params))
  }

  async addStudentToPeriodByKey (periodId, studentKey) {
    const params = [periodId, studentKey]
    await this.withClient(client => client.query(
      'insert into student.student_time_period (period_id, student_id) values ($1, (select id from student.student where key_id = $2 and is_active = true)) ON CONFLICT (period_id, student_id) DO NOTHING', params))
  }

  async deleteStudentFromPeriod (periodId, studentId) {
    const params = [periodId, studentId]
    await this.withClient(client => client.query(
      'delete from student.student_time_period where period_id = $1 and student_id = $2', params))
  }

  async removeAllStudentsFromPeriod (periodId) {
    const params = [periodId]
    await this.withClient(client => client.query(
      'delete from student.student_time_period where period_id = $1', params))
  }
}
