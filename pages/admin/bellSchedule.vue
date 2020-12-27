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
        this.showSuccess('Saved', 'Bell schedule saved')
      })
    },
    clear (timeSlot) {
      const url = '/api/admin/bellSchedule/clear'
      this.$axios.post(url, timeSlot).then((resp) => {
        this.showSuccess('Saved', 'Bell schedule cleared')
      })
    }
  }
}
</script>
