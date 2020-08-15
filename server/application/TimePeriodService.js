
export default class TimePeriodService {
  constructor (timePeriodRepo, logger) {
    this.timePeriodRepo = timePeriodRepo
    this.logger = logger
  }

  async getList () {
    const list = await this.timePeriodRepo.getList()
    return list
  }

  async add (data) {
    const { name, start, end } = data
    await this.timePeriodRepo.add(name, start, end)
  }
}
