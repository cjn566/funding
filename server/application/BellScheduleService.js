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
        id: per.id,
        name: per.periodname,
        sunday: getBellSchedule(bellSchedule, 'Sun', per.id),
        monday: getBellSchedule(bellSchedule, 'Mon', per.id),
        tuesday: getBellSchedule(bellSchedule, 'Tue', per.id),
        wednesday: getBellSchedule(bellSchedule, 'Wed', per.id),
        thursday: getBellSchedule(bellSchedule, 'Thur', per.id),
        friday: getBellSchedule(bellSchedule, 'Fri', per.id),
        saturday: getBellSchedule(bellSchedule, 'Sat', per.id)
      }
    })
    return result
  }

  async setBellSchedule (periodId, dayOfWeek, startTime, endTime) {
    return await this.bellScheduleRepo.setBellSchedule(periodId, dayOfWeek, startTime, endTime)
  }
}

function getBellSchedule (bellSchedules, dayOfWeek, id) {
  const sched = bellSchedules.filter(x => x.day_of_week == dayOfWeek && x.period_id == id)

  return {
    periodId: id,
    dayOfWeek,
    startTime: sched.length > 0 ? sched[0].start_time : null,
    endTime: sched.length > 0 ? sched[0].end_time : null
  }
}
