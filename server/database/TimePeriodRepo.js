import BaseRepo from './BaseRepo'

export default class TimePeriodRepo extends BaseRepo {
  async getList () {
    const results = await this.withClient(client => client.query(
      'select * from admin.timePeriod'))
    return results.rows
  }

  async add (name, start, stop) {
    const params = [name, start, stop]
    await this.withClient(client => client.query(
      'insert into admin.timePeriod(periodName, startTime, endTime) values ($1, $2, $3)', params))
  }
}
