<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Reports
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-tabs content-class="mt-3">
            <b-tab title="Live View" active>
              Showing most recent 20 keycard scans <br>
              Last Updated: {{ lastUpdatedDisplay }}
              <b-table
                :items="liveRecords"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :tbody-tr-class="rowClass"
                :fields="fields"
              >
                <template v-slot:head(success)="data">
                  <div class="text-center">
                    {{ data.label }}
                  </div>
                </template>
                <template v-slot:head(dateTime)="data">
                  <div class="text-right">
                    {{ data.label }}
                  </div>
                </template>

                <template v-slot:cell(flagged)="data">
                  <b-icon v-if="data.item.flagged" font-scale="1.5" class="text-warning" icon="exclamation-triangle-fill" />
                </template>
                <template v-slot:cell(studentId)="data">
                  {{ data.value }}
                </template>
                <template v-slot:cell(student)="data">
                  <div v-if="data.value">
                    {{ data.value }}
                  </div>
                  <div v-else>
                    <strong>No Match</strong>
                  </div>
                </template>
                <template v-slot:cell(success)="data">
                  <div class="text-center">
                    {{ boolAsCheck(data.value) }}
                  </div>
                </template>
                <template v-slot:cell(dateTime)="data">
                  <div class="text-right">
                    {{ data.value ? formatDate(data.value) : '-' }}
                  </div>
                </template>
              </b-table>
            </b-tab>
            <b-tab title="Historical View">
              <b-row>
                <b-col>
                  Start:
                  <div class="form-group" style="width:150px; display: inline-block;">
                    <b-form-datepicker
                      v-model="filter.startDate"
                      size="sm"
                      right
                      :date-format-options="dateFormatOptions"
                      locale="en"
                      @input="dirtyDate()"
                    />
                  </div>

                  <div class="form-group" style="width:120px; display: inline-block;">
                    <b-form-timepicker
                      v-model="filter.startTime"
                      size="sm"
                      right
                      @input="dirtyDate()"
                    />
                  </div>
                </b-col>
                <b-col>
                  End:
                  <div class="form-group" style="width:150px; display: inline-block;">
                    <b-form-datepicker
                      v-model="filter.endDate"
                      size="sm"
                      right
                      :date-format-options="dateFormatOptions"
                      locale="en"
                      @input="dirtyDate()"
                    />
                  </div>

                  <div class="form-group" style="width:120px; display: inline-block;">
                    <b-form-timepicker
                      v-model="filter.endTime"
                      size="sm"
                      right
                      @input="dirtyDate()"
                    />
                  </div>
                </b-col>
                <b-col class="text-right">
                  <b-btn variant="info" @click="loadHistorical(false)">
                    Show Results
                  </b-btn>
                  <b-btn variant="info" :disabled="dateChanged" @click="loadHistorical(true)">
                    Download Results
                  </b-btn>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-alert v-if="dateChanged" show>
                    Start/End has changed. Click 'Show Results' to see records for selected range.
                  </b-alert>
                  <b-table
                    :items="historyRecords"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    show-empty
                    :tbody-tr-class="rowClass"
                    :fields="fields"
                  >
                    <template v-slot:head(success)="data">
                      <div class="text-center">
                        {{ data.label }}
                      </div>
                    </template>
                    <template v-slot:head(dateTime)="data">
                      <div class="text-right">
                        {{ data.label }}
                      </div>
                    </template>

                    <template v-slot:cell(flagged)="data">
                      <b-icon v-if="data.item.flagged" font-scale="1.5" class="text-warning" icon="exclamation-triangle-fill" />
                    </template>
                    <template v-slot:cell(student)="data">
                      <div v-if="data.value">
                        {{ data.value }}
                      </div>
                      <div v-else>
                        <strong>No Match</strong>
                      </div>
                    </template>
                    <template v-slot:cell(success)="data">
                      <div class="text-center">
                        {{ boolAsCheck(data.value) }}
                      </div>
                    </template>
                    <template v-slot:cell(dateTime)="data">
                      <div class="text-right">
                        {{ data.value ? formatDate(data.value) : '-' }}
                      </div>
                    </template>
                  </b-table>
                </b-col>
              </b-row>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-form-group>
  </b-container>
</template>

<script>
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'
import messageMixin from '@/utils/messageMixin'
const { DateTime } = require('luxon')
const FileDownload = require('js-file-download')

export default {
  layout: 'admin',
  mixins: [formatMixin, validateMixin, messageMixin],
  data () {
    return {
      dateChanged: false,
      sortBy: 'dateTime',
      sortDesc: true,
      liveRecords: [],
      historyRecords: [],
      lastUpdated: DateTime.utc(),
      refreshTimer: null,
      queryRun: false,
      filter: {
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null
      },
      dateFormatOptions: { year: 'numeric', month: 'numeric', day: 'numeric' },
      fields: [
        {
          key: 'flagged',
          label: '',
          sortable: false,
          thStyle: 'width:45px'
        },
        {
          key: 'studentId',
          label: 'Student ID',
          sortable: false
        },
        {
          key: 'student',
          label: 'Student',
          sortable: false
        },
        {
          key: 'success',
          label: 'Success',
          sortable: false
        },
        {
          key: 'dateTime',
          label: 'Date Time',
          sortable: false
        }
      ]
    }
  },
  computed: {
    lastUpdatedDisplay () {
      return this.formatDate(this.lastUpdated, DateTime.TIME_WITH_SECONDS)
    }
  },
  mounted () {
    this.loadLive()
    this.refreshTimer = setInterval(this.loadLive, 2000)
    this.filter.startDate = DateTime.local().toISODate()
    this.filter.startTime = '00:00:00'
    this.filter.endDate = DateTime.local().toISODate()
    this.filter.endTime = '23:59:00'
    this.loadHistorical(false)
  },
  methods: {
    rowClass (item, type) {
      return item && item.success ? 'text-success' : 'text-danger'
    },
    dirtyDate () {
      this.dateChanged = true
    },
    async loadLive () {
      if (this.$route.path.includes('reports')) {
        const url = '/api/admin/report/live'
        await this.$axios.get(url)
          .then((response) => {
            this.liveRecords = response.data
            this.lastUpdated = DateTime.utc()
          })
      }
      else {
        clearInterval(this.refreshTimer)
      }
    },
    async loadHistorical (csv) {
      this.dateChanged = false
      const start = DateTime.fromFormat(this.filter.startDate + ' ' + this.filter.startTime, 'yyyy-MM-dd HH:mm:ss')
      const end = DateTime.fromFormat(this.filter.endDate + ' ' + this.filter.endTime, 'yyyy-MM-dd HH:mm:ss')
      const noCache = DateTime.local().millisecond
      const url = `/api/admin/report/history${csv ? '/csv' : ''}?start=${start}&end=${end}&_=${noCache}`
      await this.$axios.get(url).then((response) => {
        if (csv) {
          FileDownload(response.data, 'requests.csv')
        }
        else {
          this.queryRun = true
          this.historyRecords = response.data
        }
      })
    }
  }
}
</script>
