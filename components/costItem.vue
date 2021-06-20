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
          <img v-if="!isOpen" src="@/assets/icons/next-10.svg" alt="collapse" height="10px" @click="toggleCollapse">
          <img v-else src="@/assets/icons/download-12.svg" alt="expand" height="10px" @click="toggleCollapse">
        </span>
        <span v-else class="make-folder-icon" @click="makeFolder">
          <img src="@/assets/icons/more-1.svg" alt="expand" height="15px" @click="makeFolder">
        </span>
      </span>
      <span class="cost-range-spacer">
        <span v-if="isFolder" class="sum-costs">${{ costString }}</span>
        <span v-else>

          <div style="display: inline-block">
            <div v-show="editing !== 'costs'">
              <span class="text" @click="enableEditing('costs')">${{ costString }}</span>
            </div>
            <div v-show="editing === 'costs'">
              <b-form-input
                ref="costsText"
                v-model="tempValue"
                @focus="enableEditing('costs')"
                @blur="saveEdit(true)"
              />
            </div>
          </div>

        </span>
      </span>

      <div style="display: inline-block">
        <div v-show="editing !== 'text'">
          <span class="text" @click="enableEditing('text')">{{ item.name }}</span>
        </div>
        <div v-show="editing === 'text'">
          <b-form-input
            ref="text"
            v-model="tempValue"
            @focus="enableEditing('text')"
            @blur="saveEdit(true)"
          />
        </div>
      </div>
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
          max_cost: 0
        }
      }
    },
    root: {
      type: Boolean,
      default () { return false }
    }
  },
  data () {
    return {
      isOpen: false,
      editing: null,
      editables: ['costs', 'text'],
      tempValue: ''
    }
  },
  computed: {
    isFolder () {
      return this.item.children && this.item.children.length
    },
    costString () {
      return '' +
      (this.item.min_cost == null ? '0' : this.item.min_cost) +
      ((this.item.max_cost === this.item.min_cost || this.item.max_cost === null) ? '' : (' - ' + this.item.max_cost))
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
      this.editing = which
      switch (which) {
      case 'costs':
        this.tempValue = this.costString
        this.$nextTick(() => {
          this.selectAllCosts()
        })
        break
      case 'text':
        this.tempValue = this.item.name
        this.$nextTick(() => {
          this.selectAllText()
        })
      }
    },
    cycleEdit (reverse) {
      const curEditIdx = this.editables.indexOf(this.editing)
      let newEdit = this.editables[(curEditIdx + (reverse ? 1 : 1)) % this.editables.length]
      if (this.isFolder && newEdit === 'costs') {
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
      this.updateItem('costs', { min, max })
    },
    saveEdit (andClose) {
      switch (this.editing) {
      case 'costs':
        this.saveCosts()
        break
      case 'text':
        this.updateItem('name', this.tempValue)
        break
      default:
        break
      }
      if (andClose) {
        this.disableEditing()
      }
    },
    toggleCollapse () {
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
        id: this.item.id, key, value, path: this.item.path
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

      if (this.editing != null) {
        switch (event.key) {
        case 'Enter':
          this.saveEdit(true)
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
          this.enableEditing('text')
          event.preventDefault()
          break
        case 'c':
          this.enableEditing('costs')
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
}
</script>
