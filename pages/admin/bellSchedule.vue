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
        <b-col>
          <b-alert show variant="warning">
            Dev TODO: Use luxon library to properly format start/end times for each day. Inputs for start/end date. Ensure it can be changed.
          </b-alert>
        </b-col>
      </b-row>
      <b-row>
        <b-table :items="bellSchedules" />
      </b-row>
    </b-form-group>
  </b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'

export default {
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
    }
  }
}
</script>
