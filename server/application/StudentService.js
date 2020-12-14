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

  async saveStudent (id, name, key) {
    const isDupe = await this.studentRepo.checkDuplicateKey(id, key)

    if (!isDupe) {
      if (id != null) {
        await this.studentRepo.update(id, name, key)
      }
      else {
        await this.studentRepo.add(name, key)
      }
    }

    return !isDupe
  }
}
