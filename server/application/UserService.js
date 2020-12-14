const crypto = require('crypto')

export default class UserService {
  constructor (userRepo, logger) {
    this.userRepo = userRepo
    this.logger = logger
  }

  async getUserList () {
    const list = await this.userRepo.getUserList()
    return list
  }

  async isLoginValid (data) {
    const { email, password } = data
    const salt = await this.userRepo.getSalt(email)
    if (salt) {
      const hashed = genPass(salt, password)
      return await this.userRepo.checkLogin(email, hashed)
    }
    return false
  }

  async addUser (email, first, last, password) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hashed = genPass(salt, password)
    const isDupe = await this.userRepo.checkForDuplicateUserEmail(email)
    if (isDupe) {
      return false
    }
    else {
      await this.userRepo.addUser(first, last, email, salt, hashed)
      return true
    }
  }

  async updateUser (id, email, first, last) {
    await this.userRepo.updateUser(id, email, first, last)
  }

  async updateLogin (email) {
    await this.userRepo.updateLogin(email)
  }

  async changeUserState (id, isActive) {
    await this.userRepo.changeUserState(id, isActive)
  }

  async changeUserPassword (id, password) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hashed = genPass(salt, password)
    await this.userRepo.updatePassword(id, salt, hashed)
  }
}

function genPass (salt, password) {
  return crypto.pbkdf2Sync(password, salt,
    1000, 64, 'sha512').toString('hex')
}
