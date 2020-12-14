import BaseRepo from './BaseRepo'

export default class BellScheduleRepo extends BaseRepo {
  async getBellSchedule () {
    const results = await this.withClient(client => client.query(
      'select * from admin.bell_schedule')
    )
    return results.rows
  }

  async setBellSchedule (periodId, dayOfWeek, startTime, endTime) {
    const params1 = [periodId, dayOfWeek]
    const getId = await this.withClient(client => client.query(
      'select id from admin.bell_schedule where period_id = $1 and day_of_week = $2', params1)
    )

    if (getId.rows.length > 0) {
      const id = getId.rows[0].id
      const params2 = [startTime, endTime, id]
      await this.withClient(client => client.query(
        'update admin.bell_schedule set start_time = $1, end_time = $2 where  id = $3', params2))
    }
    else {
      const params3 = [periodId, dayOfWeek, startTime, endTime]
      await this.withClient(client => client.query(
        'insert into admin.bell_schedule(period_id, day_of_week, start_time, end_time) values($1,$2,$3,$4)', params3))
    }
  }
}
