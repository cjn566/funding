<template>
  <div>
    <cost-item :item="treeData" :root="true" />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import CostItem from '@/components/costItem'
Vue.use(Vuex)

function searchTree (root, path) {
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
      const item = searchTree(state.treeData, payload.path)
      if (payload.key === 'costs') {
        item.min_cost = payload.value.min
        item.max_cost = payload.value.max
        state.treeData = recalcSums(state.treeData, payload.path)
      }
      else {
        item[payload.key] = payload.value
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      // const item = searchTree(state.treeData, state.focus)
      switch (payload.action) {
      case 'up':
        break
      case 'down':
        break
      case 'in':
        break
      case 'out':
        break
      }
    },
    makeFolder (state, payload) {
      const item = searchTree(state.treeData, payload.id)
      item.children = [{
        name: item.name,
        min_cost: item.min_cost,
        max_cost: item.max_cost
      }]
    },
    addItem (state, payload) {
      const item = searchTree(state.treeData, payload.idOfParentOfNewItem)
      item.children.push({
        id: payload.newId
      })
    }
  },
  actions: {
    async newItem (context, payload) {
      const url = '/api/app/newItem/'
      await this.$axios.post(url, payload.parentId)
        .then((response) => {
          context.commit('addItem', {
            parentId: payload.parentId,
            newId: response.data
          })
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
