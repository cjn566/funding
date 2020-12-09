<template>
  <div>
    <b-input v-model="formattedStart" class="time" placeholder="ex: 9:15 AM" :state="isValidTime(start)" />
    <b-input v-model="formattedEnd" class="time" placeholder="ex: 1:00 PM" :state="isValidTime(end)" />
  </div>
</template>

<script>
const { DateTime } = require('luxon')

export default {
  props: {
    timeSlot: {
      type: Object,
      default () {
        return null
      }
    }
  },
  data () {
    return {
      start: null,
      end: null,
      timePattern: /^([0-1]?\d):(\d\d) (AM|PM)$/
    }
  },
  computed: {
    formattedStart: {
      get () {
        return this.formatted('start')
      },
      set (val) {
        this.format('start', val)
      }
    },
    formattedEnd: {
      get () {
        return this.formatted('end')
      },
      set (val) {
        this.format('end', val.toUpperCase())
      }
    }
  },
  mounted () {
    if (this.timeSlot) {
      const startTime = DateTime.fromISO(this.timeSlot.starttime)
      if (startTime.isValid) {
        this.start = startTime.toLocaleString(DateTime.TIME_SIMPLE)
      }
      const endTime = DateTime.fromISO(this.timeSlot.endtime)
      if (endTime.isValid) {
        this.end = endTime.toLocaleString(DateTime.TIME_SIMPLE)
      }
    }
  },
  methods: {
    formatted (prop) {
      const item = this[prop]
      if (item == null || item.length === 0) {
        return ''
      }
      else {
        return this[prop]
      }
    },
    format (prop, val) {
      this[prop] = val
      if (this.isValidTime(val)) {
        const res = val.match(this.timePattern)
        let hr = parseInt(res[1])
        // eslint-disable-next-line eqeqeq
        if (res[3] == 'PM') {
          hr += 12
        }
        const min = parseInt(res[2])

        let localTime = DateTime.local()
        localTime = localTime.set({ hour: hr, minute: min })

        if (prop === 'start') {
          this.timeSlot.starttime = localTime.toLocaleString(DateTime.TIME_24_SIMPLE)
        }
        if (prop === 'end') {
          this.timeSlot.endtime = localTime.toLocaleString(DateTime.TIME_24_SIMPLE)
        }

        // if both start and end times are valid, update the ball schedule
        if (this.isValidTime(this.start) && this.isValidTime(this.end)) {
          this.$emit('timeChange', this.timeSlot)
        }
      }
    },
    isValidTime (val) {
      const valid = val && this.timePattern.test(val.toUpperCase())
      return valid
    }
  }
}
</script>
