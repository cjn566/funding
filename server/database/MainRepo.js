
import BaseRepo from './BaseRepo'

export default class ReportRepo extends BaseRepo {
  async getChildren (parentId) {
    const params = [parentId]
    const results = await this.withClient(client => client.query(
      'select * from app.cost_node where parent = $1', params))
    return results.rows
  }

  async newItem (parent, name, idx) {
    const params = [parent, name, idx]
    console.log('repo new item', params)
    const results = await this.withClient(client => client.query(
      'insert into app.cost_node (parent, name, idx) values ($1, $2, $3) returning id', params))
    return results.rows[0].id
  }

  async updateItem (id, key, value) {
    const params = [value, id]
    console.log('repo update item', [key, ...params])
    const query = `update app.cost_node set ${key} = $1 where id = $2`
    try {
      await this.withClient(client => client.query(query, params))
    }
    catch (err) {
      console.log(err.message)
    }
  }

  async deleteItem (id) {
    const params = [id]
    console.log('repo delete item', params)
    const query = 'delete from app.cost_node where id = $1'
    try {
      await this.withClient(client => client.query(query, params))
    }
    catch (err) {
      console.log(err.message)
    }
  }
}
