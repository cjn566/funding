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
            <b-tab title="Live View">
              Showing most recent 20 keycard scans <br>
              Last Updated: {{ lastUpdatedDisplay }}
              <b-table
                :items="liveRecords"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
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

                <template v-slot:cell(student)="data">
                  <div>
                    {{ data.value || 'No Match' }}
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
            <b-tab title="Historical View" active>
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
                    />
                  </div>

                  <div class="form-group" style="width:120px; display: inline-block;">
                    <b-form-timepicker
                      v-model="filter.startTime"
                      size="sm"
                      right
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
                    />
                  </div>

                  <div class="form-group" style="width:120px; display: inline-block;">
                    <b-form-timepicker
                      v-model="filter.endTime"
                      size="sm"
                      right
                    />
                  </div>
                </b-col>
                <b-col class="text-right">
                  <b-btn variant="info" @click="loadHistorical(false)">
                    Show Results
                  </b-btn>
                  <b-btn variant="info" @click="loadHistorical(true)">
                    Download Results
                  </b-btn>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-table
                    :items="historyRecords"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    show-empty
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

                    <template v-slot:cell(student)="data">
                      <div>
                        {{ data.value || 'No Match' }}
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
      dateFormatOptions: { year: 'numeric', month: 'numeric', day: 'numeric' }
    }
  },
  computed: {
    lastUpdatedDisplay () {
      return this.formatDate(this.lastUpdated, DateTime.TIME_WITH_SECONDS)
    }
  },
  mounted () {
    this.loadLive()
    this.refreshTimer = setInterval(this.loadLive, 30000)
    this.filter.startDate = DateTime.local().toISODate()
    this.filter.startTime = '00:00'
    this.filter.endDate = DateTime.local().toISODate()
    this.filter.endTime = '23:59'
    this.loadHistorical(false)
  },
  methods: {
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
      const start = DateTime.fromFormat(this.filter.startDate + ' ' + this.filter.startTime, 'yyyy-MM-dd HH:mm')
      const end = DateTime.fromFormat(this.filter.endDate + ' ' + this.filter.endTime, 'yyyy-MM-dd HH:mm')
      const noCache = DateTime.local().millisecond
      const offSet = DateTime.local().offset
      console.log('offset', offSet)
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
