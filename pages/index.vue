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

// const paths = new Map()

function searchByPath (root, path) {
  let item = root
  for (let i = 0; i < path.length; i++) {
    item = item.children[path[i]]
  }
  return item
}

function buildTree (item, path, idx) {
  if (idx >= 0) {
    path.push(idx)
  }
  item.path = path
  if (item.children?.length > 0) {
    item.children = item.children.map((child, idx) => {
      return buildTree(child, [...path], idx)
    })
    item.min_cost = item.children.reduce((sum, child) => {
      return sum + child.min_cost
    }, 0)
    item.max_cost = item.children.reduce((sum, child) => {
      return sum + child.max_cost
    }, 0)
  }
  return item
}

function recalcSums (root, path) {
  const items = []
  items.push(root)
  let item
  for (let i = 0; i < path.length - 1; i++) {
    item = items[i]
    items.push(item.children[path[i]])
  }
  for (let i = items.length - 1; i > 0; i--) {
    item = items[i]
    item.min_cost = item.children.reduce((sum, child) => {
      return sum + child.min_cost
    }, 0)
    item.max_cost = item.children.reduce((sum, child) => {
      return sum + child.max_cost
    }, 0)
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
      state.treeData = buildTree(payload.items, [], -1)
    },
    updateItem (state, payload) {
      const item = searchByPath(state.treeData, payload.path)
      let rebuild = false
      payload.updates.forEach((update) => {
        if (update.key === 'min_cost' || update.key === 'max_cost') {
          rebuild = true
        }
        item[update.key] = update.value
      })
      if (rebuild) {
        state.treeData = recalcSums(state.treeData, payload.path)
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      let parent
      if (payload.path.length >= 2) {
        parent = searchByPath(state.treeData, payload.path.slice(0, payload.path.length - 1))
      }
      else {
        parent = state.treeData
      }
      const childIdx = payload.path[payload.path.length - 1]
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
          const grandparent = searchByPath(state.treeData, parent.path.slice(0, parent.path.length - 1))
          grandparent.children.splice(parent.path[parent.path.length - 1] + 1, 0, cutChild)
        }
        break
      }
      state.treeData = buildTree(state.treeData, [], -1)
    },
    makeFolder (state, payload) {
      const item = searchByPath(state.treeData, payload.path)
      const newPath = [...item.path].push(0)
      item.children = [{
        name: item.name + ' (component)',
        min_cost: item.min_cost,
        max_cost: item.max_cost,
        path: newPath
      }]
    },
    addItem (state, payload) {
      const parent = searchByPath(state.treeData, payload.parentPath)
      parent.children.push({
        // Todo: get new ID from server
        id: payload.newId
      })
    },
    deleteItem (state, payload) {
      const parent = searchByPath(state.treeData, payload.path.slice(0, payload.path.length - 1))
      parent.children.splice(payload.path[payload.path.length - 1], 1)
      state.treeData = buildTree(state.treeData, [], -1)
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
      //   path,
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
