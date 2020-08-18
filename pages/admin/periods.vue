<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Time Periods
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-alert show variant="warning">
            Dev TODO: Use luxon library to properly format start/end times for period. Get correct columns showing (no id, dateCreated, lastUpdated, isActive). Click to edit (open modal, update as needed).
          </b-alert>
        </b-col>
      </b-row>
      <b-row>
        <b-btn @click="add()">
          Add Period
        </b-btn>
      </b-row>
      <b-row>
        <b-table :items="periods" />
      </b-row>
    </b-form-group>

    <b-modal ref="entity-modal" hide-footer title="Add / Edit Period">
      <b-form-group>
        <b-input v-model="$v.period.name.$model" :state="validateState($v.period.name)" placeholder="Period Name" />
      </b-form-group>
      <b-form-group>
        <b-input v-model="$v.period.start.$model" :state="validateState($v.period.start)" placeholder="Start time (24H time)" />
      </b-form-group>
      <b-form-group>
        <b-input v-model="$v.period.end.$model" :state="validateState($v.period.end)" placeholder="End time (24H time)" />
      </b-form-group>
      <b-row>
        <b-col>
          <b-button block class="mt-3" variant="outline-danger" @click="cancel">
            Cancel
          </b-button>
        </b-col><b-col>
          <b-button block class="mt-3" variant="outline-success" @click="save">
            Save
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
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
      periods: [],
      period: {
        name: null,
        start: null,
        end: null
      }
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    add () {
      this.$refs['entity-modal'].show()
    },
    cancel () {
      this.userEmail = null
      this.period = {
        name: null,
        start: null,
        end: null
      }
      this.$refs['entity-modal'].hide()
    },
    async save () {
      const url = '/api/admin/timePeriod/'
      await this.$axios.post(url, this.period)
        .then((response) => {
          this.cancel()
          this.loadList()
        })
    },
    async loadList () {
      const url = '/api/admin/timePeriod/'

      await this.$axios.get(url)
        .then((response) => {
          this.periods = response.data
        })
    }
  }
}
</script>
