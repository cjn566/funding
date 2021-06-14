<template>
  <div class="cost-item">
    <span v-if="isFolder">
      <img v-if="!isOpen" src="@/assets/icons/next-10.svg" alt="collapse" height="10px" @click="toggle">
      <img v-else src="@/assets/icons/download-12.svg" alt="expand" height="10px" @click="toggle">
      <span class="sum-costs">~${{ item.minSum }} - {{ item.maxSum }}</span>
    </span>
    <span v-else>
      <span @click="makeFolder">*</span>
      ~$<editable-number
        :number="item.min_cost"
        @update-text="updateItem('min_cost', $event)"
      />
      -
      <editable-number
        :number="item.max_cost"
        @update-text="updateItem('max_cost', $event)"
      />
    </span>
    : <editable-text
      :text="item.name"
      @update-text="updateItem('name', $event)"
    />
    <b-collapse id="collapse-1" v-model="isOpen">
      <div v-show="isOpen" v-if="isFolder">
        <cost-item
          v-for="(child, index) in item.children"
          :key="index"
          class="item"
          :item="child"
        />
        <div class="add" @click="addItem">
          +
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import EditableText from '@/components/editableText'
import EditableNumber from '@/components/editableNumber'

export default {
  name: 'CostItem',
  components: { EditableText, EditableNumber },
  props: {
    item: {
      type: Object,
      default () {
        return {
          id: null,
          name: 'untitled',
          min_cost: 0,
          max_cost: 0,
          minSum: 0,
          maxSum: 0
        }
      }
    }
  },
  data () {
    return {
      isOpen: false
    }
  },
  computed: {
    isFolder () {
      return this.item.children && this.item.children.length
    }
  },
  methods: {

    toggle () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
    makeFolder () {
      if (!this.isFolder) {
        this.$store.commit('makeFolder', {
          id: this.item.id
        })
        this.isOpen = true
      }
    },
    updateItem (key, value) {
      this.$store.commit('updateItem', {
        id: this.item.id, key, value
      })
    },
    addItem () {
      this.$store.commit('addItem', {
        parentId: this.item.id
      })
    }
  }
}
</script>
