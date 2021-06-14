<template>
  <div style="display: inline-block">
    <div v-show="!editing">
      <span class="text" @click="enableEditing">{{ text }}</span>
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
  name: 'EditableText',
  props: {
    text: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      tempValue: null,
      editing: false
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
        this.$emit('update-text', this.tempValue)
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
