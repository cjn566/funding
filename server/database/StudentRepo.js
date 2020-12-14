import BaseRepo from './BaseRepo'

export default class StudentRepo extends BaseRepo {
  async checkAccess (studentKey) {
    if (studentKey === 1) {
      return true
    }
    if (studentKey === "2") {
      return false
    }

    console.log(studentKey)

    return "I dont fucking know."

    const params = [studentKey]

    const results = await this.withClient(client => client.query(
      `select count(*) > 0
      from student.student_time_period stp
      inner join admin.time_period atp on stp.time_period_id = atp.id
      inner join student.student ss on ss.id = stp.sudent_id and ss.key_id = $1
      and (current_time) between atp.start_time and atp.endTime`, params))

    return results.rows[0]
  }

  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from student.student order by student.name'))
    return results.rows
  }

  async checkDuplicateKey (id, key) {
    const params = [id, key]

    const results = await this.withClient(client => client.query(
      'select count(*) > 0 as cnt from student.student where key_id = $2 and is_active = true and case when $1::int is null then true else id != $1::int end', params))

    return results.rows[0].cnt
  }

  async add (name, key) {
    const params = [name, key]
    await this.withClient(client => client.query(
      'insert into student.student(name, key_id) values ($1, $2)', params))
  }

  async update (id, name, key) {
    const params = [id, name, key]
    await this.withClient(client => client.query(
      'update student.student set name = $2, key_id = $3 where id = $1', params))
  }
}
