
export default class MainService {
  constructor (mainRepo, logger) {
    this.mainRepo = mainRepo
    this.logger = logger
  }

  async getChildrenRecursively (id) {
    const children = await this.mainRepo.getChildren(id)
    for (const child of children) {
      child.children = await this.getChildrenRecursively(child.id)
    }
    return children
  }

  async getFullTree () {
    return {
      id: 1,
      children: await this.getChildrenRecursively(1)
    }
  }

  async newItem (item) {
    console.log('service new item', item)
    const result = await this.mainRepo.newItem(item.parent, item.name)
    return result
  }

  async updateItem (payload) {
    await Object.keys(payload.updates).forEach(async (key) => {
      await this.mainRepo.updateItem(payload.id, key, payload.updates[key])
    })
    console.log('\n\n\n\n\n\n')
    return true
  }

  async deleteItem (id) {
    await this.mainRepo.deleteItem(id)
    console.log('deleted')
    return true
  }
}
