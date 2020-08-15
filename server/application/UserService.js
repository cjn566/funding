const passwordHash = require('password-hash')

export default class UserService {
  constructor (userRepo, logger) {
    this.userRepo = userRepo
    this.logger = logger
  }

  async getUserList () {
    const list = await this.userRepo.getUserList()
    return list
  }

  async checkLogin (data) {
    const { email, password } = data
    const hashed = passwordHash.generate(password)
    return await this.userRepo.checkLogin(email, hashed)
  }

  async addUser (data) {
    const { email, password } = data
    const hashed = passwordHash.generate(password)
    await this.userRepo.addUser(email, hashed)
  }
}
