<template>
  <div>
    <cost-item :item="treeData" :root="true" />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import CostItem from '@/components/costItem'
Vue.use(Vuex)

// key = id
// value = { idx, parent }
const indices = new Map()

function getItemById (root, id) {
  const route = []
  let currId = id
  let item
  while (currId !== 1) {
    item = indices.get(currId)
    route.unshift(item.idx)
    currId = item.parent
  }
  item = root
  for (let i = 0; i < route.length; i++) {
    item = item.children[route[i]]
  }
  return item
}

function rebuildPaths (root, updateItem) {
  return rebuildPathsRecursively(root, -1, root.id, updateItem)
}

function rebuildPathsRecursively (item, idx, parent, updateItem) {
  if (idx >= 0 && (item.idx !== idx || item.parent !== parent)) {
    indices.set(item.id, { parent, idx })
    item.idx = idx
    item.parent = parent
    updateItem(item.id, idx, parent)
  }
  if (item.children?.length > 0) {
    item.children = item.children.map((child, idx) => {
      return rebuildPathsRecursively(child, idx, item.id, updateItem)
    })
  }
  return item
}

function startBuildTree (root) {
  indices.clear()
  return buildTreeRecursively(root, -1)
}

function buildTreeRecursively (item, idx) {
  if (idx >= 0) {
    indices.set(item.id, { parent: item.parent, idx })
  }
  if (item.children?.length > 0) {
    item.children = item.children.sort((a, b) => {
      return (a.idx || 0) - (b.idx || 0)
    })
    item.children = item.children.map((child, idx) => {
      return buildTreeRecursively(child, idx)
    })
    item = calcItemCostSums(item)
  }
  return item
}

function calcItemCostSums (item) {
  item.min_cost = item.children.reduce((sum, child) => {
    return sum + (child.checked ? 0 : child.min_cost)
  }, 0)
  item.max_cost = item.children.reduce((sum, child) => {
    return sum + (child.checked ? 0 : child.max_cost)
  }, 0)
  return item
}

function recalcSums (root, id) {
  // Build route of indices to target item
  let foo = indices.get(id)
  const route = [foo.idx]
  let parentId = foo.parent
  while (parentId !== 1) {
    foo = indices.get(parentId)
    route.unshift(foo.idx)
    parentId = foo.parent
  }
  // Create a chain of item references down to the modified item
  const items = [root]
  let item
  for (let i = 0; i < route.length - 1; i++) {
    item = items[i]
    items.push(item.children[route[i]])
  }
  // Reverse the chain, calculating the sums on the way up
  for (let i = items.length - 1; i > 0; i--) {
    item = items[i]
    item = calcItemCostSums(item)
  }
  return items[0]
}

const store = new Vuex.Store({
  state: {
    treeData: {},
    focused: 1
  },
  mutations: {
    setItems (state, payload) {
      state.treeData = startBuildTree(payload.items)
    },
    updateItem (state, payload) {
      const item = getItemById(state.treeData, payload.id)
      let rebuildSums = false
      Object.keys(payload.updates).forEach((key) => {
        if (key === 'min_cost' || key === 'max_cost' || key === 'checked') {
          rebuildSums = true
        }
        item[key] = payload.updates[key]
      })
      if (rebuildSums) {
        state.treeData = recalcSums(state.treeData, payload.id)
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      // TODO: keep focus on the moved item
      let rootAffected = null
      const parent = getItemById(state.treeData, payload.parent)
      const childIdx = indices.get(payload.id).idx
      switch (payload.action) {
      case 'up':
        // Move child up within it's siblings. If already at top, do nothing.
        if (childIdx > 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx - 1, 0, cutChild)
          rootAffected = parent
        }
        break
      case 'down':
        // Move child down within it's siblings. If already at bottom, do nothing.
        if (childIdx < (parent.children.length - 1)) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx + 1, 0, cutChild)
          rootAffected = parent
        }
        break
      case 'in':
        // If the item has a sibling above it that already has children
        if (childIdx > 0) {
          const destItem = parent.children[childIdx - 1]
          let doTheThing = false
          // If it already has children
          if (destItem.children?.length > 0) {
            doTheThing = true
          }
          // If it has no costs
          else if (!destItem.min_cost && !destItem.max_cost) {
            doTheThing = true
          }
          // If the user wishes to lose assiciated costs
          else if (confirm(`This action will cause ${destItem.name} to become a collection, losing it's associated costs. Do you wish to do this?`)) {
            doTheThing = true
          }
          if (doTheThing) {
            const cutChild = parent.children.splice(childIdx, 1)[0]
            parent.children[childIdx - 1].children.push(cutChild)
            rootAffected = parent
          }
        }
        break
      case 'out':
        // If the item's parent is not root, move the item to be the next sibling of it's parent
        if (parent.id !== 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          const grandparent = getItemById(state.treeData, parent.parent)
          grandparent.children.splice(parent.idx + 1, 0, cutChild)
          rootAffected = grandparent
        }
        break
      }
      if (rootAffected !== null) {
        rootAffected = rebuildPaths(rootAffected, (id, idx, parent) => {
          const url = '/api/app/updateItem'
          axios.post(url, {
            id,
            updates: {
              idx,
              parent
            }
          })
        })
        state.treeData = recalcSums(state.treeData, rootAffected.id)
      }
    },
    deleteItem (state, payload) {
      const parent = getItemById(state.treeData, payload.parent)
      parent.children.splice(payload.idx, 1)
      recalcSums(state.treeData, parent.id)
    }
  },
  actions: {
    async newSibling (context, payload) {
      const boop = indices.get(payload.id)
      const parent = getItemById(context.state.treeData, boop.parent)
      const placement = boop.idx + 1
      let newItem = {
        name: 'new item',
        parent: parent.id,
        idx: placement,
        min_cost: null,
        max_cost: null
      }
      newItem = await context.dispatch('newItem', newItem)
      parent.children.splice(placement, 0, newItem)
    },
    async makeCollection (context, payload) {
      const parent = getItemById(context.state.treeData, payload.id)
      let newItem = {
        name: parent.name + ' (component 1)',
        parent: parent.id,
        idx: 0,
        min_cost: parent.min_cost,
        max_cost: parent.max_cost
      }
      newItem = await context.dispatch('newItem', newItem)
      parent.is_open = true
      parent.children = [newItem]
    },
    async newItem (context, item) {
      const url = '/api/app/newItem'
      const result = await axios.post(url, item)
      item.id = result.data
      indices.set(item.id, { idx: item.idx, parent: item.parent })
      return item
    },
    updateItem (context, payload) {
      const url = '/api/app/updateItem'
      // payload = {
      //   id,
      //   updates: {
      //       key: value,
      //       ...
      //   }
      // }
      axios.post(url, payload)
      context.commit('updateItem', payload)
    },
    deleteItem ({ commit }, payload) {
      const url = '/api/app/deleteItem/' + payload.id
      axios.delete(url)
      commit('deleteItem', payload)
    }
  }
})

export default {
  layout: 'default',
  store,
  components: {
    CostItem
  },
  data () {
    return {}
  },
  computed: {
    treeData () {
      return store.state.treeData
    }
  },
  mounted () {
    this.getItems()
  },
  methods: {
    async getItems () {
      const url = '/api/app/items/'
      await this.$axios.get(url)
        .then((response) => {
          store.commit('setItems', {
            items: response.data
          })
        })
    }
  }
}
</script>
