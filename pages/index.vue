<template>
  <div>
    <cost-item :item="rootItem" />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import CostItem from '@/components/costItem'
Vue.use(Vuex)

function fullSum (items) {
  return fullSumRecur(1, items)
}

function fullSumRecur (id, items) {
  const item = items[id]
  if (item.children.length > 0) {
    item.children.map(childId => fullSumRecur(childId, items))
    calcItemCostSums(item, items)
  }
}

function calcItemCostSums (item, items) {
  let child
  item.min_cost = 0
  item.max_cost = 0
  item.children.map((childId) => {
    child = items[childId]
    if (!child.checked) {
      item.min_cost += child.min_cost
      item.max_cost += child.max_cost
    }
  })
}

function recalcSums (items, id) {
  let item = items[id]
  while (item.parent) {
    item = items[item.parent]
    item = calcItemCostSums(item)
  }
}

const store = new Vuex.Store({
  state: {
    items: {},
    focused: 1,
    editing: null,
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
      state.items = payload.items
      fullSum(state.items)
    },
    updateItem (state, payload) {
      const item = state.items[payload.id]
      let rebuildSums = false
      Object.keys(payload.updates).forEach((key) => {
        switch (key) {
        case 'min_cost':
        case 'max_cost':
        case 'checked':
          rebuildSums = true
        }
        item[key] = payload.updates[key]
      })
      if (rebuildSums) {
        recalcSums(state.items, payload.id)
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      // TODO: keep focus on the moved item
      // let rootAffected = null
      // const parent = getItemById(state.treeData, payload.parent)
      // const childIdx = treeMap.get(payload.id).idx
      // switch (payload.action) {
      // case 'up':
      //   // Move child up within it's siblings. If already at top, do nothing.
      //   if (childIdx > 0) {
      //     const cutChild = parent.children.splice(childIdx, 1)[0]
      //     parent.children.splice(childIdx - 1, 0, cutChild)
      //     state.focused = cutChild.id
      //     rootAffected = parent
      //   }
      //   break
      // case 'down':
      //   // Move child down within it's siblings. If already at bottom, do nothing.
      //   if (childIdx < (parent.children.length - 1)) {
      //     const cutChild = parent.children.splice(childIdx, 1)[0]
      //     parent.children.splice(childIdx + 1, 0, cutChild)
      //     state.focused = cutChild.id
      //     rootAffected = parent
      //   }
      //   break
      // case 'in':
      //   // If the item has a sibling above it...
      //   if (childIdx > 0) {
      //     const destItem = parent.children[childIdx - 1]
      //     let doTheThing = false
      //     // ...that already has children
      //     if (destItem.children?.length > 0) {
      //       doTheThing = true
      //     }
      //     // Or if it has no costs
      //     else if (!destItem.min_cost && !destItem.max_cost) {
      //       doTheThing = true
      //     }
      //     // Or if the user wishes to lose assiciated costs
      //     else if (confirm(`This action will cause ${destItem.name} to become a collection, losing it's associated costs. Do you wish to do this?`)) {
      //       doTheThing = true
      //     }
      //     if (doTheThing) {
      //       const cutChild = parent.children.splice(childIdx, 1)[0]
      //       parent.children[childIdx - 1].children.push(cutChild)
      //       state.focused = cutChild.id
      //       rootAffected = parent
      //     }
      //   }
      //   break
      // case 'out':
      //   // If the item's parent is not root, move the item to be the next sibling of it's parent
      //   if (parent.id !== 0) {
      //     const cutChild = parent.children.splice(childIdx, 1)[0]
      //     const grandparent = getItemById(state.treeData, parent.parent)
      //     grandparent.children.splice(parent.idx + 1, 0, cutChild)
      //     state.focused = cutChild.id
      //     rootAffected = grandparent
      //   }
      //   break
      // }
      // if (rootAffected !== null) {
      //   rootAffected = rebuildPaths(rootAffected, state.updateOrder)
      //   state.treeData = recalcSums(state.treeData, rootAffected.id)
      // }
    },
    deleteItem (state, payload) {
      // const parent = getItemById(state.treeData, payload.parent)
      // parent.children.splice(payload.idx, 1)
      // recalcSums(state.treeData, parent.id)
    },
    focus (state, payload) {
      let former = state.items[state.focused]
      let parent = null
      if (former.parent !== null) {
        parent = state.items[former.parent]
      }
      switch (payload.how) {
      case 'me':
        state.focused = payload.id
        break
      case 'up':
        if (former.idx === 0) {
          // move focus from first child up to parent, if there is one
          if (parent) {
            state.focused = parent.id
          }
        }
        else {
          // Check if the sibling above is expanded
          let item = state.items[parent.children[former.idx - 1]]
          while (item.children.length > 0 && item.is_open) {
            item = state.items[item.children[item.children.length - 1]]
          }
          // move focus to sibling above
          state.focused = item.id
        }
        break
      case 'down': {
        // Check if the former has children and is expanded
        if (former.children.length > 0 && former.is_open) {
          state.focused = former.children[0]
        }
        else if (parent) {
          while (former.idx === parent.children.length - 1) {
            if (parent.parent) {
              former = parent
              parent = state.items[parent.parent]
            }
          }
          // move focus to sibling above
          state.focused = parent.children[former.idx + 1]
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
      const parent = context.state.items[payload.parent]
      const placement = payload.idx + 1
      let newItem = {
        name: 'new item',
        parent: parent.id,
        idx: placement,
        min_cost: null,
        max_cost: null
      }
      newItem = await context.dispatch('newItem', newItem)
      newItem.children = []
      parent.children.map((childid) => {
        const child = context.state.items[childid]
        if (child.idx >= placement) {
          child.idx++
          context.dispatch('updateItem', { id: childid, updates: { idx: child.idx } })
        }
      })
      parent.children.push(newItem.id)
    },
    async makeCollection (context, payload) {
      const newParent = context.state.items[payload.id]
      let newItem = {
        name: newParent.name + ' (component 1)',
        parent: newParent.id,
        idx: 0,
        min_cost: newParent.min_cost,
        max_cost: newParent.max_cost
      }
      newItem = await context.dispatch('newItem', newItem)
      newItem.children = []
      newParent.is_open = true
      newParent.children = [newItem.id]
      context.state.items[newItem.id] = newItem
      context.state.focused = newItem.id
      context.state.editing = 'text'
    },
    async newItem (context, item) {
      const url = '/api/app/newItem'
      const result = await axios.post(url, item)
      item.id = result.data
      return item
    },
    updateItem (context, payload) {
      const url = '/api/app/updateItem'
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
    rootItem () {
      return this.$store.state.items[1]
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
