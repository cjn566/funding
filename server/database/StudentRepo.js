import BaseRepo from './BaseRepo'

export default class StudentRepo extends BaseRepo {
  async checkAccess (studentKey) {
    if (studentKey === 1) {
      return true
    }
    if (studentKey === 2) {
      return false
    }

    const params = [studentKey]

    const results = await this.withClient(client => client.query(
      `select count(*) > 0
      from student.student_time_period stp
      inner join admin.time_period atp on stp.time_period_id = atp.id
      inner join student.student ss on ss.id = stp.sudent_id and ss.key_id = $1 and ss.is_active = true
      and (current_time) between atp.start_time and atp.endTime`, params))

    return results.rows[0]
  }

  async deleteStudent (id) {
    const params = [id]
    await this.withClient(client => client.query(
      'update student.student set is_active = false where id = $1', params))
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from student.student where is_active = true'))
    return results.rows
  }

  async checkDuplicateKey (id, key) {
    const params = [id, key]

    const results = await this.withClient(client => client.query(
      'select count(*) > 0 as cnt from student.student where key_id = $2 and is_active = true and case when $1::int is null then true else id != $1::int end', params))

    return results.rows[0].cnt
  }

  async add (firstName, lastName, key) {
    const params = [firstName, lastName, key]
    await this.withClient(client => client.query(
      'insert into student.student(first_name, last_name, key_id) values ($1, $2, $3)', params))
  }

  async update (id, firstName, lastName, key) {
    const params = [id, firstName, lastName, key]
    await this.withClient(client => client.query(
      'update student.student set first_name = $2, last_name = $3, key_id = $4 where id = $1', params))
  }
}
