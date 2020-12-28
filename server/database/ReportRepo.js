import BaseRepo from './BaseRepo'

export default class ReportRepo extends BaseRepo {
  async getLive (recordCount) {
    const params = [recordCount]
    const results = await this.withClient(client => client.query(
      `select ssa.student_key, ss.first_name, ss.last_name, ssa.success, ssa.date_created
      from student.student_access ssa
      left outer join student.student ss on ssa.student_id = ss.id
      order by ssa.date_created desc limit $1`, params))

    return results.rows
  }

  async getHistorical (start, end, currentPage, pageSize) {
    const params = [start, end, currentPage, pageSize]
    const results = await this.withClient(client => client.query(
      `select ssa.student_key, ss.first_name, ss.last_name, ssa.success, ssa.date_created
      from student.student_access ssa
      left outer join student.student ss on ssa.student_id = ss.id
      where ssa.date_created >= $1 and ssa.date_created <= $2
      order by ssa.date_created
      limit $4
      offset ($3 - 1) * $4;`, params))

    return results.rows
  }
}
