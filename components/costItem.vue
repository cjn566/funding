<template>
  <div>
    <b-row
      ref="me"
      class="cost-item-row"
      tabindex="0"
      @keydown="keyCheck"
    >
      <span class="collapse-icons-spacer">
        <span v-if="isFolder">
          <img v-if="!isOpen" src="@/assets/icons/next-10.svg" alt="collapse" height="10px" @click="toggle">
          <img v-else src="@/assets/icons/download-12.svg" alt="expand" height="10px" @click="toggle">
        </span>
        <span v-else class="make-folder-icon" @click="makeFolder">
          <img src="@/assets/icons/more-1.svg" alt="expand" height="15px" @click="makeFolder">
        </span>
      </span>
      <span class="cost-range-spacer">
        <span v-if="isFolder" class="sum-costs">${{ item.minSum }} - {{ item.maxSum }}</span>
        <span v-else>
          <editable-costs
            ref="costs"
            :min="item.min_cost"
            :max="item.max_cost"
            @update-min="updateItem('min_cost', $event)"
            @update-max="updateItem('max_cost', $event)"
          />
        </span>
      </span>
      <editable-text
        ref="text"
        :text="item.name"
        @update-text="updateItem('name', $event)"
      />
    </b-row>
    <b-collapse id="collapse-1" v-model="isOpen" class="cost-item-full">
      <cost-item
        v-for="(child, index) in item.children"
        ref="childRefs"
        :key="index"
        :item="child"
        @focus-change="focusChange(index, $event)"
      />
    </b-collapse>
  </div>
</template>

<script>
import EditableText from '@/components/editableText'
import EditableCosts from '@/components/editableCosts'

export default {
  name: 'CostItem',
  components: { EditableText, EditableCosts },
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
      this.takeFocus()
    },
    addItem () {
      this.$store.commit('addItem', {
        parentId: this.item.id
      })
    },
    takeFocus (fromBelow = false) {
      if (fromBelow && this.isFolder && this.isOpen) {
        this.$refs.childRefs[this.$refs.childRefs.length - 1].takeFocus(fromBelow)
      }
      else {
        this.$refs.me.focus()
        // this.$store.commit('setFocus', {
        //   id: this.item.id
        // })
      }
    },
    focusChange (idx, event) {
      switch (event) {
      case 'up':
        if (idx === 0) {
          this.takeFocus()
        }
        else {
          this.$refs.childRefs[idx - 1].takeFocus(true)
        }
        break
      case 'down':
        if (idx === this.$refs.childRefs.length - 1) {
          this.$emit('focus-change', 'down')
        }
        else {
          this.$refs.childRefs[idx + 1].takeFocus()
        }
        break
      }
    },
    keyCheck (event) {
      const shift = event.getModifierState('Shift')
      const ctrl = event.getModifierState('Control')
      switch (event.key) {
      case 'ArrowUp':
        if (!ctrl) {
          this.$emit('focus-change', 'up')
        }
        else {
          this.$store.commit('relocateItem', { id: this.item.id, action: 'up' })
        }
        break
      case 'ArrowDown':
        if (!ctrl) {
          if (this.isFolder && this.isOpen) {
            this.$refs.childRefs[0].takeFocus()
          }
          else {
            this.$emit('focus-change', 'down')
          }
        }
        else {
          this.$store.commit('relocateItem', { id: this.item.id, action: 'down' })
        }
        break
      case 'ArrowLeft':
        if (this.isFolder) {
          this.isOpen = false
        }
        event.preventDefault()
        break
      case 'ArrowRight':
        if (this.isFolder) {
          this.isOpen = true
        }
        break
      case 'Tab':
        if (shift) {
          this.$store.commit('relocateItem', { id: this.item.id, action: 'out' })
        }
        else {
          this.$store.commit('relocateItem', { id: this.item.id, action: 'in' })
        }
        event.preventDefault()
        break
      case 'e':
        this.$refs.text.enableEditing()
        event.preventDefault()
        break
      case 'c':
        this.$refs.costs.enableEditing()
        event.preventDefault()
        break
      case 'Delete':
        break
      case 'Space':
        break
      default:
        break
      }
    }
  }
}
</script>
