
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

  async newItem (parentId) {
    const result = await this.mainRepo.newItem(parentId)
    return result.id
  }
}
