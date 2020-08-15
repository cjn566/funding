import BaseRepo from './BaseRepo'

export default class UserRepo extends BaseRepo {
  async getUserList () {
    const results = await this.withClient(client => client.query(
      'select id, email from admin.user'))
    return results.rows
  }

  async addUser (email, passwordHashed) {
    const params = [email, passwordHashed]
    await this.withClient(client => client.query(
      'insert into admin.user(email, password) values ($1, $2)', params))
  }
}
