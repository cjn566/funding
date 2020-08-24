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
        sunday: getBellSchedule(bellSchedule, 'Sun', per.periodname),
        monday: getBellSchedule(bellSchedule, 'Mon', per.periodname),
        tuesday: getBellSchedule(bellSchedule, 'Tue', per.periodname),
        wednesday: getBellSchedule(bellSchedule, 'Wed', per.periodname),
        thursday: getBellSchedule(bellSchedule, 'Thur', per.periodname),
        friday: getBellSchedule(bellSchedule, 'Fri', per.periodname),
        saturday: getBellSchedule(bellSchedule, 'Sat', per.periodname)
      }
    })
    return result
  }

  async setBellSchedule (periodName, dayOfWeek, startTime, endTime) {
    return await this.bellScheduleRepo.setBellSchedule(periodName, dayOfWeek, startTime, endTime)
  }
}

function getBellSchedule (bellSchedules, dayOfWeek, periodName) {
  const sched = bellSchedules.filter(x => x.dayofweek == dayOfWeek && x.periodname == periodName)
  return sched.length > 0 ? sched[0] : { starttime: null, endtime: null, dayofweek: dayOfWeek, periodname: periodName }
}
