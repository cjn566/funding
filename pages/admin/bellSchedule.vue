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
        <b-table :items="bellSchedules">
          <template v-slot:cell(sunday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(monday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(tuesday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(wednesday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(thursday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(friday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
          </template>
          <template v-slot:cell(saturday)="data">
            <bell-schedule-times :time-slot="data.value" @timeChange="timeChanged($event)" />
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
import BellScheduleTimes from '@/components/bellScheduleTimes'

export default {
  components: {
    BellScheduleTimes
  },
  mixins: [formatMixin, validateMixin],
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
      bellSchedules: []
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
        const msg = `${timeSlot.dayofweek} ${timeSlot.periodname}`
        this.$bvToast.toast(msg, {
          title: 'Bell Schedule Saved',
          autoHideDelay: 5000,
          variant: 'success',
          solid: true,
          appendToast: false,
          toaster: 'b-toaster-bottom-right'
        })
      })
    }
  }
}
</script>
