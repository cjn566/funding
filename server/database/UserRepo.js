import BaseRepo from './BaseRepo'

export default class UserRepo extends BaseRepo {
  async getUserList () {
    const results = await this.withClient(client => client.query(
      'select id, email, first_name, last_name, last_login, is_active from admin.user'))
    return results.rows
  }

  async checkForDuplicateUserEmail (email) {
    const params = [email]
    const ret = await this.withClient(client => client.query(
      'select count(*) > 0 as cnt from admin.user where email = $1', params))
    return ret.rows[0].cnt
  }

  async checkForDuplicateUserEmailOnUpdate (id, email) {
    const params = [email, id]
    const ret = await this.withClient(client => client.query(
      'select count(*) > 0 as cnt from admin.user where email = $1 and id != $2', params))
    return ret.rows[0].cnt
  }

  async addUser (first, last, email, salt, passwordHashed) {
    const params = [first, last, email, salt, passwordHashed]
    await this.withClient(client => client.query(
      'insert into admin.user(first_name, last_name, email, salt, password) values ($1, $2, $3, $4, $5)', params))
  }

  async getSalt (email) {
    const params = [email]
    const ret = await this.withClient(client => client.query(
      'select salt from admin.user where email = $1', params))
    return ret.rows.length > 0 ? ret.rows[0].salt : null
  }

  async checkLogin (email, passwordHashed) {
    const params = [email, passwordHashed]
    const ret = await this.withClient(x => x.query(
      'select count(*) as cnt from admin.user where email=$1 and password = $2 and is_active = true', params))

    return ret.rows[0].cnt > 0
  }

  async updateLogin (email) {
    const params = [email]
    await this.withClient(client => client.query(
      'update admin.user set last_login = (now() at time zone \'utc\') where email = $1 ', params))
  }

  async updateUser (id, email, first, last) {
    const params = [id, email, first, last]
    await this.withClient(client => client.query(
      'update admin.user set email = $2, first_name = $3, last_name = $4 where id = $1', params))
  }

  async changeUserState (id, isActive) {
    const params = [id, isActive]
    await this.withClient(client => client.query(
      'update admin.user set is_active = $2 where id = $1', params))
  }

  async updatePassword (id, salt, hashed) {
    const params = [id, salt, hashed]
    await this.withClient(client => client.query(
      'update admin.user set salt = $2, password = $3 where id = $1', params))
  }
}
