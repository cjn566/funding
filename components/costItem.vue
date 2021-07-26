<template>
  <div>
    <b-row
      ref="me"
      class="cost-item-row"
      :class="{ checked: isChecked }"
      tabindex="0"
      @keydown="keyCheck"
      @click="clicked"
    >
      <span class="collapse-icons-spacer">
        <span v-if="isCollection">
          <img v-if="!item.is_open" src="@/assets/icons/next-10.svg" alt="collapse" height="10px" @click="toggleCollapse">
          <img v-else src="@/assets/icons/download-12.svg" alt="expand" height="10px" @click="toggleCollapse">
        </span>
        <span v-else class="make-collection-icon" @click="makeCollection">
          <img src="@/assets/icons/more-1.svg" alt="expand" height="15px">
        </span>
      </span>

      <div class="name-and-costs">
        <div style="display: inline-block" class="name-section" @dblclick="enableEditing('text')">
          <div v-show="editing !== 'text'" class="text">
            {{ item.name }}
          </div>
          <div v-show="editing === 'text'">
            <b-form-input
              ref="text"
              v-model="tempValue"
              size="sm"
              @focus="enableEditing('text')"
              @blur="saveEdit(true)"
            />
          </div>
        </div>

        <span v-show="!noCost || editing === 'costs'" class="cost-range-spacer">
          <span v-if="isCollection" class="sum-costs">${{ costString }}</span>
          <span v-else>
            <div style="display: inline-block">
              <div v-show="editing !== 'costs'">
                <span class="editable-costs" @click="enableEditing('costs')">${{ costString }}</span>
              </div>
              <div v-show="editing === 'costs'">
                <b-form-input
                  ref="costsText"
                  v-model="tempValue"
                  size="sm"
                  class="costs-input"
                  @focus="enableEditing('costs')"
                  @blur="saveEdit(true)"
                />
              </div>
            </div>
          </span>
        </span>
      </div>
    </b-row>

    <b-collapse id="collapse-1" v-model="item.is_open" class="cost-item-full">
      <cost-item
        v-for="(child, index) in children"
        ref="childRefs"
        :key="index"
        :item="child"
        :inheritchecked="isChecked"
        @focus-change="focusChange(index, $event)"
      />
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'CostItem',
  props: {
    item: {
      type: Object,
      default () {
        return {
          id: null,
          name: 'untitled',
          min_cost: 0,
          max_cost: 0,
          checked: false,
          is_open: true,
          children: []
        }
      }
    },
    inheritchecked: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      editing: null,
      editables: ['costs', 'text'],
      tempValue: ''
    }
  },
  computed: {
    isChecked () {
      return this.inheritchecked || this.item.checked
    },
    isCollection () {
      return this.item.children.length > 0
    },
    noCost () {
      return this.costs[0] === 0 || (this.costs[0] == null && this.costs[1] == null)
    },
    costString () {
      return '' + this.costs[0] +
      ((this.costs[1] === this.costs[0] || this.costs[1] === null) ? '' : (' - ' + this.costs[1]))
    },
    costs () {
      if (this.isChecked) {
        return [0, 0]
      }
      if (this.isCollection) {
        const sum = this.children.reduce((s, c) => {
          if (c.checked) {
            return s
          }
          return [s[0] + c.min_cost, s[1] + c.max_cost]
        }, [0, 0])
        if (this.item.min_cost !== sum[0] || this.item.max_cost !== sum[1]) {
          this.$store.commit('updateItem', { id: this.item.id, updates: { min_cost: sum[0], max_cost: sum[1] } })
        }
        return sum
      }
      return [this.item.min_cost, this.item.max_cost]
    },
    focused () {
      return this.$store.state.focused
    },
    children () {
      const inflatedChildren = this.item.children.map((childid, idx) => {
        const child = this.$store.state.items[childid]
        if (child.idx !== idx) {
          this.$store.dispatch('updateItem', { id: child.id, updates: { idx } })
        }
        return child
      })
      return inflatedChildren
    }
  },
  watch: {
    focused (n, old) {
      if (n.id === this.item.id) {
        this.takeFocus(false)
      }
    }
  },
  mounted () {
    if (this.focused.id === this.item.id) {
      this.takeFocus(false)
      this.enableEditing('text')
    }
  },
  methods: {
    selectAllCosts () {
      this.$refs.costsText.focus()
      this.$refs.costsText.select()
    },
    selectAllText () {
      this.$refs.text.focus()
      this.$refs.text.select()
    },
    enableEditing (which) {
      switch (which) {
      case 'costs':
        if (!this.isCollection) {
          this.editing = which
          this.tempValue = this.costString
          this.$nextTick(() => {
            this.selectAllCosts()
          })
        }
        break
      case 'text':
        this.editing = which
        this.tempValue = this.item.name
        this.$nextTick(() => {
          this.selectAllText()
        })
      }
    },
    cycleEdit (reverse) {
      const curEditIdx = this.editables.indexOf(this.editing)
      let newEdit = this.editables[(curEditIdx + (reverse ? 1 : 1)) % this.editables.length]
      if (this.isCollection && newEdit === 'costs') {
        newEdit = this.editables[(curEditIdx + (reverse ? 2 : 2)) % this.editables.length]
      }
      this.enableEditing(newEdit)
    },
    disableEditing () {
      this.tempValue = null
      this.editing = null
    },
    saveCosts () {
      const regexp = /((\d*\.?\d+))/g
      const array = this.tempValue.match(regexp)
      let min = null
      let max = null
      if (array?.length > 0) {
        const first = parseFloat(array[0])
        const second = parseFloat(array[1])
        if (!isNaN(first)) {
          min = first
          if (!isNaN(second)) {
            if (first < second) {
              max = second
            }
            else {
              min = second
              max = first
            }
          }
          else {
            max = first
          }
        }
      }
      if (min !== this.item.min_cost || max !== this.item.max_cost) {
        this.updateItem({ min_cost: min, max_cost: max })
      }
    },
    saveEdit (andClose) {
      switch (this.editing) {
      case 'costs':
        this.saveCosts()
        break
      case 'text':
        if (this.tempValue !== this.item.name) {
          this.updateItem({ name: this.tempValue })
        }
        break
      default:
        break
      }
      if (andClose) {
        this.disableEditing()
      }
    },
    toggleCollapse () {
      if (this.isCollection) {
        this.updateItem({ is_open: !this.item.is_open })
      }
    },
    makeCollection () {
      if (!this.isCollection) {
        this.$store.dispatch('makeCollection', {
          id: this.item.id
        })
      }
    },
    updateItem (updates) {
      this.$store.dispatch('updateItem', {
        id: this.item.id,
        updates
      })
      this.takeFocus()
    },
    addItem () {
      this.$store.commit('addItem', {
        id: this.item.id
      })
    },
    dblclicked (event) {
      this.enableEditing('text')
    },
    clicked (event) {
      event.preventDefault()
      this.takeFocus()
    },
    takeFocus (fromBelow = false) {
      if (fromBelow && this.isCollection && this.item.is_open) {
        this.$refs.childRefs[this.$refs.childRefs.length - 1].takeFocus(fromBelow)
      }
      else {
        this.$refs.me.focus()
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
    harakiri () {
      this.$store.dispatch('deleteItem', {
        id: this.item.id,
        parent: this.item.parent,
        idx: this.item.idx
      })
    },
    keyCheck (event) {
      const shift = event.getModifierState('Shift')
      const ctrl = event.getModifierState('Control')

      if (this.editing != null) {
        switch (event.key) {
        case 'Enter':
          this.saveEdit(true)
          this.takeFocus()
          break
        case 'Tab':
          this.cycleEdit(shift)
          event.preventDefault()
          break
        case 'ArrowUp':
          this.saveEdit(true)
          this.$emit('focus-change', 'up')
          break
        case 'ArrowDown':
          this.saveEdit(true)
          this.$emit('focus-change', 'down')
          break
        }
      }
      else {
        switch (event.key) {
        case 'ArrowUp':
          if (!ctrl) {
            this.$emit('focus-change', 'up')
          }
          else {
            this.$store.dispatch('relocateItem', {
              id: this.item.id,
              parent: this.item.parent,
              idx: this.item.idx,
              action: 'up'
            })
          }
          break
        case 'ArrowDown':
          if (!ctrl) {
            if (this.isCollection && this.item.is_open) {
              this.$refs.childRefs[0].takeFocus()
            }
            else {
              this.$emit('focus-change', 'down')
            }
          }
          else {
            this.$store.dispatch('relocateItem', {
              id: this.item.id,
              parent: this.item.parent,
              idx: this.item.idx,
              action: 'down'
            })
          }
          break
        case 'ArrowLeft':
          if (this.isCollection) {
            this.updateItem({ is_open: false })
          }
          event.preventDefault()
          break
        case 'ArrowRight':
          if (this.isCollection) {
            this.updateItem({ is_open: true })
          }
          break
        case 'Tab':
          if (shift) {
            this.$store.dispatch('relocateItem', {
              id: this.item.id,
              parent: this.item.parent,
              idx: this.item.idx,
              action: 'out'
            })
          }
          else {
            this.$store.dispatch('relocateItem', {
              id: this.item.id,
              parent: this.item.parent,
              idx: this.item.idx,
              action: 'in'
            })
          }
          event.preventDefault()
          break
        case 'e':
          this.enableEditing('text')
          event.preventDefault()
          break
        case 'c':
          this.enableEditing('costs')
          event.preventDefault()
          break
        case 'x':
          this.makeCollection()
          break
        case 'Delete':
          this.harakiri()
          break
        case ' ':
          this.updateItem({ checked: !this.item.checked })
          break
        case 'Enter':
          this.$store.dispatch('newSibling', { parent: this.item.parent, idx: this.item.idx })
          break
        default:
          break
        }
      }
    }
  }
}
</script>
