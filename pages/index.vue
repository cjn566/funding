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

const paths = new Map()

function getItemById (root, id) {
  let item = root
  const path = paths.get(id)
  for (let i = 0; i < path.length; i++) {
    item = item.children[path[i]]
  }
  return item
}

function startBuildTree (root) {
  paths.clear()
  return buildTreeRecursively(root, [], -1)
}

function buildTreeRecursively (item, path, idx) {
  if (idx >= 0) {
    path.push(idx)
    paths.set(item.id, path)
    item.order = idx
  }
  if (item.children?.length > 0) {
    item.children.sort((a, b) => {
      return (b.order || 0) - (a.order || 0)
    })
    item.children = item.children.map((child, idx) => {
      return buildTreeRecursively(child, [...path], idx)
    })
    calcItemCostSums(item)
  }
  return item
}

function calcItemCostSums (item) {
  item.min_cost = item.children.reduce((sum, child) => {
    return sum + child.min_cost
  }, 0)
  item.max_cost = item.children.reduce((sum, child) => {
    return sum + child.max_cost
  }, 0)
}

function recalcSums (root, id) {
  const items = [root]
  const path = paths.get(id)
  let item
  // Create a chain of item references down to the modified item
  for (let i = 0; i < path.length - 1; i++) {
    item = items[i]
    items.push(item.children[path[i]])
  }
  // Reverse the chain, calculating the sums on the way up
  for (let i = items.length - 1; i > 0; i--) {
    item = items[i]
    calcItemCostSums(item)
  }
  return items[0]
}

const store = new Vuex.Store({
  state: {
    treeData: {},
    focus: null
  },
  mutations: {
    setItems (state, payload) {
      state.treeData = startBuildTree(payload.items)
    },
    updateItem (state, payload) {
      const item = getItemById(state.treeData, payload.id)
      let rebuildSums = false
      payload.updates.forEach((update) => {
        if (update.key === 'min_cost' || update.key === 'max_cost') {
          rebuildSums = true
        }
        item[update.key] = update.value
      })
      if (rebuildSums) {
        state.treeData = recalcSums(state.treeData, payload.id)
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      const parent = getItemById(state.treeData, payload.parent)
      // TODO: implement order
      const childIdx = payload.order
      switch (payload.action) {
      case 'up':
        // Move child up within it's siblings. If already at top, do nothing.
        if (childIdx > 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx - 1, 0, cutChild)
        }
        break
      case 'down':
        // Move child down within it's siblings. If already at bottom, do nothing.
        if (childIdx < (parent.children.length - 1)) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx + 1, 0, cutChild)
        }
        break
      case 'in':
        // If the item has a sibling above it that already has children,
        // add it to the end of that sibling's children
        if (childIdx > 0 && parent.children[childIdx - 1].children?.length > 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children[childIdx - 1].children.push(cutChild)
        }
        break
      case 'out':
        // If the item's parent is not root, move the item to be the next sibling of it's parent
        if (parent.id !== 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          const grandparent = getItemById(state.treeData, parent.parent)
          grandparent.children.splice(parent.order + 1, 0, cutChild)
        }
        break
      }
      state.treeData = startBuildTree(state.treeData)
    },
    makeFolder (state, payload) {
      // TODO: ...
      const item = getItemById(state.treeData, payload.id)
      const newPath = [...item.path].push(0)
      item.children = [{
        name: item.name + ' (component)',
        min_cost: item.min_cost,
        max_cost: item.max_cost,
        path: newPath
      }]
    },
    addItem (state, payload) {
      const parent = getItemById(state.treeData, payload.parentPath)
      parent.children.push({
        // Todo: get new ID from server
        id: payload.newId
      })
    },
    deleteItem (state, payload) {
      // TODO: Delete (or mark deleted) full descendent tree from server
      const parent = getItemById(state.treeData, payload.parent)
      parent.children.splice(payload.order, 1)
      state.treeData = startBuildTree(state.treeData)
    }
  },
  actions: {
    async newItem (context, payload) {
      const url = '/api/app/newItem/'
      await axios.post(url, payload.parentId)
        .then((response) => {
          context.commit('addItem', {
            parentId: payload.parentId,
            newId: response.data
          })
        })
    },
    async updateItem (context, payload) {
      const url = '/api/app/updateItem'
      // payload = {
      //   id,
      //   updates: [
      //     {
      //       key,
      //       value
      //     },
      //     ...
      //   ]
      // }
      await axios.post(url, payload)
        .then((response) => {
          context.commit('updateItem', payload)
        })
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
