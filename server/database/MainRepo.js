
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
}
