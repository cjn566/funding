<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Periods
          </h1>
        </b-col>
      </b-row>
      <div v-if="!isEditMode">
        <b-row>
          <b-btn @click="add()">
            Add Period
          </b-btn>
        </b-row>
        <b-row>
          <b-table
            :items="periods"
            :fields="fields"
            hover
            small
            show-empty
            @row-clicked="editPeriod"
          >
            <template v-slot:head(isActive)="data">
              <div class="text-center">
                {{ data.label }}
              </div>
            </template>
            <template v-slot:cell(isActive)="data">
              <div class="text-center">
                {{ boolAsCheck(data.value) }}
              </div>
            </template>
          </b-table>
        </b-row>
      </div>
      <div v-if="isEditMode">
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.period.name.$model" :state="validateState($v.period.name)" placeholder="Period Name" />
            </b-form-group>
          </b-col>
        </b-row>
        <!-- commenting out, not sure if we want to support disabling periods -->
        <!-- <b-row v-if="!$v.period.$anyDirty && !isNew">
          <b-col md="4" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="deactivate">
              Deactivate
            </b-button>
          </b-col>
        </b-row> -->
        <b-row v-if="$v.period.$anyDirty">
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancel">
              Cancel
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="save">
              Save
            </b-button>
          </b-col>
        </b-row>
      </div>
    </b-form-group>
  </b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'
import messageMixin from '@/utils/messageMixin'

export default {
  mixins: [formatMixin, validateMixin, messageMixin],
  layout: 'admin',
  validations: {
    period: {
      name: {
        required
      }
    }
  },
  data () {
    return {
      isEditMode: false,
      periods: [],
      period: {
        id: null,
        name: null,
        isActive: null
      },
      fields: [
        {
          key: 'periodName',
          label: 'Name',
          sortable: false
        },
        {
          key: 'isActive',
          label: 'Active',
          sortable: false
        }
      ]
    }
  },
  computed: {
    isNew () {
      return this.period.id == null
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    editPeriod (val) {
      this.$v.period.$reset()
      this.isEditMode = true
      this.period.id = val.id
      this.period.name = val.periodName
      this.period.isActive = val.isActive
    },
    add () {
      this.$v.period.$reset()
      this.isEditMode = true
    },
    cancel () {
      this.period = {
        name: null
      }
      this.isEditMode = false
    },
    deactivate () {
      this.period.isActive = false
      this.doSave()
    },
    save () {
      this.$v.period.$touch()
      if (!this.$v.period.$invalid) {
        if (this.periods.map(x => x.periodname).includes(this.period.name)) {
          this.showError('Duplicate', 'There is already a period with that name.')
        }
        else {
          this.doSave()
        }
      }
    },
    async doSave () {
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
