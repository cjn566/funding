<template>
  <ul id="demo">
    <cost-item
      class="item"
      :item="treeData"
      @make-folder="makeFolder"
      @add-item="addItem"
    />
  </ul>
</template>

<script>
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'
import messageMixin from '@/utils/messageMixin'
import CostItem from '@/components/costItem'

export default {
  layout: 'admin',
  components: {
    CostItem
  },
  mixins: [formatMixin, validateMixin, messageMixin],
  data () {
    return {
      treeData: {
        name: 'My Tree',
        children: [
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            children: [
              {
                name: 'child folder',
                children: [{ name: 'hello' }, { name: 'wat' }]
              },
              { name: 'hello' },
              { name: 'wat' },
              {
                name: 'child folder',
                children: [{ name: 'hello' }, { name: 'wat' }]
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    makeFolder (item) {
      item.children = []
      this.addItem(item)
    },
    addItem (item) {
      item.children.push({
        name: 'new stuff'
      })
    }
  }
}
</script>
