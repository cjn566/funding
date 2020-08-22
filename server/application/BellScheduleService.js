/* eslint-disable eqeqeq */

export default class BellScheduleService {
  constructor (bellScheduleRepo, timePeriodRepo, logger) {
    this.bellScheduleRepo = bellScheduleRepo
    this.timePeriodRepo = timePeriodRepo
    this.logger = logger
  }

  async getBellSchedule () {
    const bellSchedule = await this.bellScheduleRepo.getBellSchedule()
    const periods = await this.timePeriodRepo.getList()

    // build return objects
    const result = await periods.map((per) => {
      return {
        name: per.periodname,
        sunday: bellSchedule.find(x => x.dayofweek == 'Sun' && x.periodname == per.periodname),
        monday: bellSchedule.find(x => x.dayofweek == 'Mon' && x.periodname == per.periodname),
        tuesday: bellSchedule.find(x => x.dayofweek == 'Tue' && x.periodname == per.periodname),
        wednesday: bellSchedule.find(x => x.dayofweek == 'Wed' && x.periodname == per.periodname),
        thursday: bellSchedule.find(x => x.dayofweek == 'Thur' && x.periodname == per.periodname),
        friday: bellSchedule.find(x => x.dayofweek == 'Fri' && x.periodname == per.periodname),
        saturday: bellSchedule.find(x => x.dayofweek == 'Sat' && x.periodname == per.periodname)
      }
    })
    return result
  }

  async setBellSchedule (periodName, dayOfWeek, startTime, endTime) {
    return await this.bellScheduleRepo.setBellSchedule(periodName, dayOfWeek, startTime, endTime)
  }
}
