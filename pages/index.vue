<template>
  <div @keydown="keyCheck">
    <cost-item
      v-for="(child, index) in treeData.children"
      :key="index"
      class="cost-item"
      :item="child"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
import CostItem from '@/components/costItem'
Vue.use(Vuex)

function searchTree (item, id) {
  if (item.id === id) {
    return item
  }
  else if (item.children != null) {
    let i
    let result = null
    for (i = 0; result == null && i < item.children.length; i++) {
      result = searchTree(item.children[i], id)
    }
    return result
  }
  return null
}

function buildSums (item) {
  if (item.children?.length > 0) {
    item.children = item.children.map((child) => {
      return buildSums(child)
    })
    item.minSum = item.children.reduce((sum, child) => {
      return sum + child.minSum
    }, 0)
    item.maxSum = item.children.reduce((sum, child) => {
      return sum + child.maxSum
    }, 0)
  }
  else {
    item.minSum = item.min_cost
    item.maxSum = item.max_cost
  }
  return item
}

const store = new Vuex.Store({
  state: {
    treeData: {},
    focus: null
  },
  mutations: {
    setItems (state, payload) {
      state.treeData = buildSums(payload.items)
    },
    updateItem (state, payload) {
      searchTree(state.treeData, payload.id)[payload.key] = payload.value
      if (payload.key === 'min_cost' || payload.key === 'max_cost') {
        state.treeData = buildSums(state.treeData)
      }
    },
    // setFocus (state, payload) {
    //   state.focus = payload.id
    // },
    relocateItem (state, payload) {
      const item = searchTree(state.treeData, state.focus)
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
