// repositories
import StudentRepo from './database/StudentRepo'
import UserRepo from './database/UserRepo'
import TimePeriodRepo from './database/TimePeriodRepo'
import BellScheduleRepo from './database/BellScheduleRepo'
import ReportRepo from './database/ReportRepo'

// Services
import StudentService from './application/StudentService'
import UserService from './application/UserService'
import TimePeriodService from './application/TimePeriodService'
import BellScheduleService from './application/BellScheduleService'
import ReportService from './application/ReportService'

export default class ApplcationRegistry {
  constructor (dbPool, winstonLogger) {
    this.dbPool = dbPool
    this.winstonLogger = winstonLogger
  }

  createStudentService () {
    const studentRepo = new StudentRepo(this.dbPool, this.winstonLogger)
    const timePeriodRepo = new TimePeriodRepo(this.dbPool, this.winstonLogger)
    const studentService = new StudentService(studentRepo, timePeriodRepo, this.winstonLogger)

    return studentService
  }

  createUserService () {
    const userRepo = new UserRepo(this.dbPool, this.winstonLogger)
    const userService = new UserService(userRepo, this.winstonLogger)

    return userService
  }

  createTimePeriodService () {
    const timePeriodRepo = new TimePeriodRepo(this.dbPool, this.winstonLogger)
    const timePeriodService = new TimePeriodService(timePeriodRepo, this.winstonLogger)

    return timePeriodService
  }

  createBellScheduleService () {
    const bellScheduleRepo = new BellScheduleRepo(this.dbPool, this.winstonLogger)
    const timePeriodRepo = new TimePeriodRepo(this.dbPool, this.winstonLogger)
    const bellScheduleService = new BellScheduleService(bellScheduleRepo, timePeriodRepo, this.winstonLogger)

    return bellScheduleService
  }

  createReportService () {
    const reportRepo = new ReportRepo(this.dbPool, this.winstonLogger)
    const reportService = new ReportService(reportRepo, this.winstonLogger)

    return reportService
  }
}
