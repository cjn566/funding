// repositories
import StudentRepo from './database/StudentRepo'
import UserRepo from './database/UserRepo'
import TimePeriodRepo from './database/TimePeriodRepo'

// Services
import StudentService from './application/StudentService'
import UserService from './application/UserService'
import TimePeriodService from './application/TimePeriodService'

export default class ApplcationRegistry {
  constructor (dbPool, winstonLogger) {
    this.dbPool = dbPool
    this.winstonLogger = winstonLogger
  }

  createStudentService () {
    const studentRepo = new StudentRepo(this.dbPool, this.winstonLogger)
    const studentService = new StudentService(studentRepo, this.winstonLogger)

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
}
