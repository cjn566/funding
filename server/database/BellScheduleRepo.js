import BaseRepo from './BaseRepo'

export default class BellScheduleRepo extends BaseRepo {
  async getBellSchedule () {
    const results = await this.withClient(client => client.query(
      'select * from admin.bellSchedule')
    )
    return results.rows
  }

  async setBellSchedule (periodName, dayOfWeek, startTime, endTime) {
    const params1 = [periodName, dayOfWeek]
    const getId = await this.withClient(client => client.query(
      'select id from admin.bellSchedule where periodName = $1 and dayOfWeek = $2', params1)
    )

    if (getId.rows.length > 0) {
      const id = getId.rows[0].id
      const params2 = [startTime, endTime, id]
      await this.withClient(client => client.query(
        'update admin.bellSchedule set startTime = $1, endTime = $2 where  id = $3', params2))
    }
    else {
      const params3 = [periodName, dayOfWeek, startTime, endTime]
      await this.withClient(client => client.query(
        'insert into admin.bellSchedule(periodName, dayOfWeek, startTime, endTime) values($1,$2,$3,$4)', params3))
    }
  }
}
