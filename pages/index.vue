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
// value = { idx, parent, children[] }
const treeMap = new Map()

function getItemById (root, id) {
  const route = []
  let currId = id
  let item
  while (currId !== 1) {
    item = treeMap.get(currId)
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
  // TODO: this is fucky...
  if (idx >= 0 && (item.idx !== idx || item.parent !== parent)) {
    treeMap.set(item.id, {
      parent,
      idx
    })
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
  treeMap.clear()
  return buildTreeRecursively(root, -1)
}

function buildTreeRecursively (item, idx) {
  if (idx >= 0) {
    treeMap.set(item.id, {
      parent: item.parent,
      idx
    })
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
  // Build route of treeMap to target item
  let foo = treeMap.get(id)
  const route = [foo.idx]
  let parentId = foo.parent
  while (parentId !== 1) {
    foo = treeMap.get(parentId)
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
    focused: 1,
    updateOrder: (id, idx, parent) => {
      const url = '/api/app/updateItem'
      axios.post(url, {
        id,
        updates: {
          idx,
          parent
        }
      })
    }
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
      const childIdx = treeMap.get(payload.id).idx
      switch (payload.action) {
      case 'up':
        // Move child up within it's siblings. If already at top, do nothing.
        if (childIdx > 0) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx - 1, 0, cutChild)
          state.focused = cutChild.id
          rootAffected = parent
        }
        break
      case 'down':
        // Move child down within it's siblings. If already at bottom, do nothing.
        if (childIdx < (parent.children.length - 1)) {
          const cutChild = parent.children.splice(childIdx, 1)[0]
          parent.children.splice(childIdx + 1, 0, cutChild)
          state.focused = cutChild.id
          rootAffected = parent
        }
        break
      case 'in':
        // If the item has a sibling above it...
        if (childIdx > 0) {
          const destItem = parent.children[childIdx - 1]
          let doTheThing = false
          // ...that already has children
          if (destItem.children?.length > 0) {
            doTheThing = true
          }
          // Or if it has no costs
          else if (!destItem.min_cost && !destItem.max_cost) {
            doTheThing = true
          }
          // Or if the user wishes to lose assiciated costs
          else if (confirm(`This action will cause ${destItem.name} to become a collection, losing it's associated costs. Do you wish to do this?`)) {
            doTheThing = true
          }
          if (doTheThing) {
            const cutChild = parent.children.splice(childIdx, 1)[0]
            parent.children[childIdx - 1].children.push(cutChild)
            state.focused = cutChild.id
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
          state.focused = cutChild.id
          rootAffected = grandparent
        }
        break
      }
      if (rootAffected !== null) {
        rootAffected = rebuildPaths(rootAffected, state.updateOrder)
        state.treeData = recalcSums(state.treeData, rootAffected.id)
      }
    },
    deleteItem (state, payload) {
      const parent = getItemById(state.treeData, payload.parent)
      parent.children.splice(payload.idx, 1)
      recalcSums(state.treeData, parent.id)
    },
    focus (state, how) {
      const former = treeMap.get(state.focused)
      let parent = null
      if (former.parent !== null) {
        parent = treeMap.get(former.parent)
      }
      switch (how) {
      case 'up':
        if (former.idx === 0) {
          // move focus from first child up to parent, if there is one
          if (parent) {
            state.focused = parent.id
          }
        }
        else {
          // Check if the sibling above is expanded
          let item = getItemById(state.treeData, parent.children[former.idx - 1])
          while (item.children?.length > 0 && item.is_open) {
            item = getItemById(state.treeData, item.children[item.children.length - 1])
          }
          // move focus to sibling above
          state.focused = item.id // TODO: implement children in treeMap map
        }
        break
      case 'down': {
        // Check if the former has children and is expanded
        const formerAsItem = getItemById(state.treeData, state.focused)
        if (formerAsItem.children?.length > 0 && formerAsItem.is_open) {
          state.focused = formerAsItem.children[0].id
        }
        else {
          const parentAsItem = getItemById(state.treeData, former.parent)
          if (former.idx > parentAsItem.children.length - 1) {
            // Move focus to former's next sibling
            state.focused = parentAsItem.children[former.idx + 1].id
          }
          else {
            // Check if there is a sibling, keep escalating until there is one or reach the end
            let item = getItemById(state.treeData, parent.id)
            while (item.children?.length > 0 && item.is_open) {
              item = getItemById(state.treeData, item.children[item.children.length - 1])
            }
            // move focus to sibling above
            state.focused = item.id // TODO: implement children in treeMap map
          }
        }
        break
      }
      default:
        break
      }
    }
  },
  actions: {
    async newSibling (context, payload) {
      const boop = treeMap.get(payload.id)
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
      treeMap.set(item.id, { idx: item.idx, parent: item.parent })
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
