<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Bell Schedule
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-table
          :items="bellSchedules"
          :fields="fields"
        >
          <template v-slot:cell(name)="data">
            {{ data.value }}
            <div v-if="isActive(data.item)" class="small text-success">
              Active
            </div>
            <div v-if="!isActive(data.item)" class="small text-danger">
              Inactive
            </div>
            <b-btn v-if="isActive(data.item)" style="font-size: .6em; width:100px;" size="sm" variant="outline-danger" @click="clearPeriod(data.item)">
              Clear Period
            </b-btn>
          </template>
          <template v-slot:cell(sunday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(monday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(tuesday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(wednesday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(thursday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(friday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
          <template v-slot:cell(saturday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" @clear="clear($event)" />
          </template>
        </b-table>
      </b-row>
    </b-form-group>
  </b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'
import messageMixin from '@/utils/messageMixin'
import BellScheduleTimes from '@/components/bellScheduleTimes'

export default {
  components: {
    BellScheduleTimes
  },
  mixins: [formatMixin, validateMixin, messageMixin],
  layout: 'admin',
  validations: {
    period: {
      name: {
        required
      },
      start: {
        required
      },
      end: {
        required
      }
    }
  },
  data () {
    return {
      bellSchedules: [],
      fields: [
        {
          key: 'name',
          label: 'Name',
          sortable: false
        },
        {
          key: 'sunday',
          label: 'Sunday',
          sortable: false
        },
        {
          key: 'monday',
          label: 'Monday',
          sortable: false
        },
        {
          key: 'tuesday',
          label: 'Tuesday',
          sortable: false
        },
        {
          key: 'wednesday',
          label: 'Wednesday',
          sortable: false
        },
        {
          key: 'thursday',
          label: 'Thursday',
          sortable: false
        },
        {
          key: 'friday',
          label: 'Friday',
          sortable: false
        },
        {
          key: 'saturday',
          label: 'Saturday',
          sortable: false
        }
      ]
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    isActive (period) {
      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = period
      return (monday && monday.startTime != null && monday.endTime != null) ||
       (tuesday && tuesday.startTime != null && tuesday.endTime != null) ||
       (wednesday && wednesday.startTime != null && wednesday.endTime != null) ||
       (thursday && thursday.startTime != null && thursday.endTime != null) ||
       (friday && friday.startTime != null && friday.endTime != null) ||
       (saturday && saturday.startTime != null && saturday.endTime != null) ||
       (sunday && sunday.startTime != null && sunday.endTime != null)
    },
    async getData () {
      // get time periods
      const url = '/api/admin/bellSchedule/'

      await this.$axios.get(url)
        .then((response) => {
          this.bellSchedules = response.data
        })
    },
    timeChanged (timeSlot) {
      const url = '/api/admin/bellSchedule/'
      this.$axios.post(url, timeSlot).then((resp) => {
        const perName = this.bellSchedules.filter(x => x.id === timeSlot.periodId)[0].name
        this.showSuccess('Saved', `${perName} ${timeSlot.dayOfWeek} schedule saved`)
      })
    },
    clearPeriod (period) {
      const url = `/api/admin/bellSchedule/${period.id}/clear`
      this.$axios.post(url).then((resp) => {
        this.showSuccess('Saved', `${period.name} cleared`)
        this.getData()
      })
    },
    clear (timeSlot) {
      const url = '/api/admin/bellSchedule/clear'
      this.$axios.post(url, timeSlot).then((resp) => {
        const perName = this.bellSchedules.filter(x => x.id === timeSlot.periodId)[0].name
        this.showSuccess('Saved', `${perName} ${timeSlot.dayOfWeek} cleared`)
      })
    }
  }
}
</script>
