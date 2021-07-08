
export default class MainService {
  constructor (mainRepo, logger) {
    this.mainRepo = mainRepo
    this.logger = logger
  }

  async getChildrenRecursively (id, map) {
    const children = await this.mainRepo.getChildren(id)
    for (const child of children) {
      child.children = await this.getChildrenRecursively(child.id, map)
      map.set(child.id, child)
    }
    return children.sort((a, b) => {
      return a.idx - b.idx
    }).map(c => c.id)
  }

  async getFullTree () {
    const res = new Map()
    const children = await this.getChildrenRecursively(1, res)
    // TODO: unfuck this
    res.set(1, { name: 'root', id: 1, idx: 0, parent: null, children, is_open: true })
    return res
  }

  async newItem (item) {
    console.log('service new item', item)
    const result = await this.mainRepo.newItem(item.parent, item.name, item.idx)
    return result
  }

  async updateItem (payload) {
    await Object.keys(payload.updates).forEach(async (key) => {
      await this.mainRepo.updateItem(payload.id, key, payload.updates[key])
    })
    return true
  }

  async deleteItem (id) {
    await this.mainRepo.deleteItem(id)
    console.log('deleted')
    return true
  }
}
