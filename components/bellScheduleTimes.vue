<template>
  <div>
    <b-form-timepicker
      v-model="start"
      class="no-validation-icons"
      placeholder="start"
      dropup
      size="sm"
      :no-close-button="true"
      :state="valid"
      @shown="startShown"
      @hidden="timeChanged"
    />
    <b-form-timepicker
      v-model="end"
      class="no-validation-icons"
      placeholder="end"
      size="sm"
      :no-close-button="true"
      :disabled="start === null"
      :state="valid"
      @shown="endShown"
      @hidden="timeChanged"
    />
    <b-btn v-if="start !== null || end !== null" style="font-size: .6em; width:100%;" size="sm" variant="outline-danger" @click="clear()">
      Clear
    </b-btn>
  </div>
</template>

<script>
const { DateTime } = require('luxon')

export default {
  props: {
    timeSlot: {
      type: Object,
      default () {
        return {

        }
      }
    }
  },
  data () {
    return {
      start: null,
      end: null
    }
  },
  computed: {
    valid () {
      if (this.start !== null && this.end !== null) {
        const start = DateTime.fromFormat(this.start, 'HH:mm:ss')
        const end = DateTime.fromFormat(this.end, 'HH:mm:ss')
        if (start < end) {
          return true
        }
        else {
          return false
        }
      }
      else {
        return null
      }
    }
  },
  watch: {
    timeSlot: {
      deep: true,
      handler (val, oldVal) {
        if (val.startTime === null) {
          this.start = null
        }
        if (val.endTime === null) {
          this.end = null
        }
      }
    }
  },
  mounted () {
    if (this.timeSlot) {
      const startTime = DateTime.fromISO(this.timeSlot.startTime)
      if (startTime.isValid) {
        this.start = startTime.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }
      const endTime = DateTime.fromISO(this.timeSlot.endTime)
      if (endTime.isValid) {
        this.end = endTime.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }
    }
  },
  methods: {
    clear () {
      this.$emit('clear', this.timeSlot)
      this.start = null
      this.end = null
    },
    startShown () {
      if (this.start == null) {
        this.start = '08:00:10'
      }
    },
    endShown () {
      if (this.end == null) {
        const start = DateTime.fromFormat(this.start, 'HH:mm:ss')
        const newEnd = start.plus({ hours: 1 })
        this.end = newEnd.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }
    },
    timeChanged () {
      if (this.valid) {
        this.timeSlot.startTime = this.start
        this.timeSlot.endTime = this.end
        this.$emit('timeChange', this.timeSlot)
      }
    }
  }
}
</script>
