import BaseRepo from './BaseRepo'

export default class ReportRepo extends BaseRepo {
  async getLive (recordCount) {
    const params = [recordCount]
    const results = await this.withClient(client => client.query(
      `select ssa.student_key, ss.first_name, ss.last_name, ssa.success, ssa.date_created,
      (
        select count(*) > 1 as cnt
        from student.student_access ssa2
        where ssa2.date_created > ssa.date_created - INTERVAL '5 minutes'
        AND ssa2.date_created <= ssa.date_created
        AND ssa2.student_id = ssa.student_id
      ) as flagged
      from student.student_access ssa
      left outer join student.student ss on ssa.student_id = ss.id
      order by ssa.date_created desc limit $1`, params))

    return results.rows
  }

  async getHistorical (start, end, currentPage, pageSize) {
    const params = [start, end, currentPage, pageSize]
    const results = await this.withClient(client => client.query(
      `select ssa.student_key, ss.first_name, ss.last_name, ssa.success, ssa.date_created,
      (
        select count(*) > 1 as cnt
        from student.student_access ssa2
        where ssa2.date_created > ssa.date_created - INTERVAL '5 minutes'
        AND ssa2.date_created <= ssa.date_created
        AND ssa2.student_id = ssa.student_id
      ) as flagged
      from student.student_access ssa
      left outer join student.student ss on ssa.student_id = ss.id
      where ssa.date_created >= $1 and ssa.date_created <= $2
      order by ssa.date_created
      limit $4
      offset ($3 - 1) * $4;`, params))

    return results.rows
  }
}
