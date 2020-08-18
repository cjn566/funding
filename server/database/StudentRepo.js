import BaseRepo from './BaseRepo'

export default class StudentRepo extends BaseRepo {
  async checkAccess (studentKey) {
    const params = [studentKey]

    const results = await this.withClient(client => client.query(
      `select count(*) > 0
      from student.studentTimePeriod stp
      inner join admin.timePeriod atp on stp.timePeriodId = atp.id
      inner join student.student ss on ss.id = stp.studentId and ss.keyId = $1
      and (current_time at time zone 'utc') between atp.startTime and atp.EndTime`, params))

    return results.rows[0]
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from student.student order by student.name'))
    return results.rows
  }

  async add (name, key) {
    const params = [name, key]
    await this.withClient(client => client.query(
      'insert into student.student(name, keyId) values ($1, $2)', params))
  }
}
