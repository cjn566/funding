
import BaseRepo from './BaseRepo'

export default class ReportRepo extends BaseRepo {
  async getChildren (parentId) {
    const params = [parentId]
    const results = await this.withClient(client => client.query(
      'select * from app.cost_node where parent = $1', params))
    return results.rows
  }

  async newItem (parentId) {
    const params = [parentId]
    const results = await this.withClient(client => client.query(
      'insert into app.cost_node (parent) values ($1) returning id', params))
    return results.rows[0].id
  }

  async updateItem (id, key, value) {
    const params = [value, id]
    console.log(params)
    const query = `update app.cost_node set ${key} = $1 where id = $2`
    await this.withClient(client => client.query(query, params))
  }
}
