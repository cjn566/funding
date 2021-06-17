<template>
  <div style="display: inline-block">
    <div v-show="!editing">
      <span class="text" @click="enableEditing">${{ text }}</span>
    </div>
    <div v-show="editing">
      <b-form-input
        ref="text"
        v-model="tempValue"
        @focus="selectAll"
        @blur="saveEdit"
        @keydown="keyCheck"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditableNumber',
  props: {
    min: {
      type: Number,
      default () {
        return 0
      }
    },
    max: {
      type: Number,
      default () {
        return 0
      }
    }
  },
  data () {
    return {
      tempValue: null,
      editing: false
    }
  },
  computed: {
    text () {
      return '' + (this.min == null ? '0' : this.min) + (this.max == null ? '' : (' - ' + this.max))
    }
  },
  methods: {
    selectAll () {
      this.$refs.text.focus()
      this.$refs.text.select()
    },
    enableEditing () {
      this.tempValue = this.text
      this.editing = true
      this.$nextTick(() => {
        this.selectAll()
      })
    },
    disableEditing () {
      this.tempValue = null
      this.editing = false
    },
    saveEdit () {
      if (this.editing) {
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
          }
        }
        this.$emit('update-min', min)
        this.$emit('update-max', max)
        this.disableEditing()
      }
    },
    keyCheck (event) {
      if (event.which === 13) {
        this.saveEdit()
      }
    }
  }
}
</script>
