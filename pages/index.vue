<template>
  <div v-if="loaded">
    <cost-item :item="rootItem" />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import CostItem from '@/components/costItem'
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    items: {},
    focused: {
      id: 1,
      pulse: false
    }
  },
  mutations: {
    setItems (state, payload) {
      state.items = payload.items
    },
    addItem (state, item) {
      state.items[item.id] = item
    },
    updateItem (state, payload) {
      const item = state.items[payload.id]
      Object.keys(payload.updates).forEach((key) => {
        item[key] = payload.updates[key]
      })
    },
    focus (state, id) {
      state.focused = { id, pulse: !state.focused.pulse }
    },
    deleteItem (state, payload) {
      const parent = state.items[payload.parent]
      parent.children.splice(payload.idx, 1)
    }
  },
  actions: {
    async newSibling (context, payload) {
      const parent = context.state.items[payload.parent]
      const placement = payload.idx + 1
      let newItem = {
        name: 'new item',
        parent: parent.id,
        idx: placement
        // min_cost: 1,
        // max_cost: 2
      }
      Vue.set(newItem, 'min_cost', 1)
      Vue.set(newItem, 'max_cost', 2)
      newItem = await context.dispatch('newItem', newItem)
      parent.children.splice(placement, 0, newItem.id)
      context.commit('focus', newItem.id)
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
      newParent.is_open = true
      newParent.children.push(newItem.id)
      context.commit('focus', newItem.id)
      context.state.editing = 'text'
    },
    async newItem (context, item) {
      const url = '/api/app/newItem'
      const result = await axios.post(url, item)
      item.id = result.data
      item.children = []
      context.commit('addItem', item)
      return item
    },
    updateItem (context, payload) {
      const url = '/api/app/updateItem'
      axios.post(url, payload)
      context.commit('updateItem', payload)
    },
    relocateItem (context, payload) {
      const itemIdx = payload.idx
      const parent = context.state.items[payload.parent]
      switch (payload.action) {
      case 'up':
        // Move child up within it's siblings. If already at top, do nothing.
        if (itemIdx > 0) {
          parent.children.splice(itemIdx - 1, 0, parent.children.splice(itemIdx, 1)[0])
        }
        break
      case 'down':
        // Move child down within it's siblings. If already at bottom, do nothing.
        if (itemIdx < (parent.children.length - 1)) {
          parent.children.splice(itemIdx + 1, 0, parent.children.splice(itemIdx, 1)[0])
        }
        break
      case 'in':
        // If the item has a sibling above it...
        if (itemIdx > 0) {
          const destItem = context.state.items[parent.children[itemIdx - 1]]
          let doTheThing = false
          // ...that already has children
          if (destItem.children.length > 0) {
            doTheThing = true
          }
          // Or if it has no costs
          else if (!destItem.min_cost && !destItem.max_cost) {
            doTheThing = true
          }
          // Or if the user wishes to lose associated costs
          else if (confirm(`This action will cause ${destItem.name} to become a collection, losing it's associated costs. Do you wish to do this?`)) {
            doTheThing = true
          }
          if (doTheThing) {
            const cutChild = parent.children.splice(itemIdx, 1)[0]
            const newParent = context.state.items[parent.children[itemIdx - 1]]
            newParent.children.push(cutChild)
            context.dispatch('updateItem', {
              id: payload.id,
              updates: {
                parent: newParent.id
              }
            })
          }
        }
        break
      case 'out':
        // If the item's parent is not root, move the item to be the next sibling of it's parent
        if (parent.id !== 1) {
          const grandparent = context.state.items[parent.parent]
          parent.children.splice(itemIdx, 1)
          grandparent.children.splice(parent.idx + 1, 0, payload.id)
          context.dispatch('updateItem', {
            id: payload.id,
            updates: {
              parent: grandparent.id
            }
          })
        }
        break
      }
      context.commit('focus', payload.id)
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
    return {
    }
  },
  computed: {
    rootItem () {
      return this.$store.state.items[1]
    },
    loaded () {
      return Object.keys(this.$store.state.items).length > 0
    }
  },
  mounted () {
    this.getItems()
  },
  methods: {
    async getItems () {
      const url = '/api/app/items/'
      const items = await this.$axios.get(url)
      store.commit('setItems', { items: items.data })
    }
  }
}
</script>
