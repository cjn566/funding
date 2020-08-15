export default class StudentService {
  constructor (studentRepo, logger) {
    this.studentRepo = studentRepo
    this.logger = logger
  }

  async checkAccess (studentKey) {
    const hasAccess = await this.studentRepo.checkAccess(studentKey)
    return hasAccess
  }

  async getList () {
    const list = await this.studentRepo.getList()
    return list
  }

  async add (data) {
    const { name, key } = data
    await this.studentRepo.add(name, key)
  }
}
