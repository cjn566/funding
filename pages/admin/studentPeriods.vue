
<template>
  <b-container>
    <b-row class="page-header">
      <b-col>
        <h1>
          Student Assignment
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-alert show variant="info">Drag student names into the time periods that they are allowed to access. A student can be in more than one time period. Click the delete button next to a student to remove them.</b-alert>

        <b-alert show variant="warning">Dev TODO: Use luxon library to properly format start/end times for period. Add 'clear all' to each period.</b-alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <h2>Students</h2>
        <div v-for="student in students" :key="student.keyid" class="student-drag">
          <h3>
            <drag :transfer-data="{ studentKeyId: student.keyid }">
              <b-badge>
                {{ student.name }}
              </b-badge>
            </drag>
          </h3>
        </div>
      </b-col>
      <b-col>
        <h2>Time Periods</h2>
        <div v-for="period in periods" :key="period.id" class="time-period">
          <drop @drop="handleDrop($event, period.period.id)">
            <h3>
              {{ period.period.periodname }} <span class="small text-muted">{{ period.period.starttime }} - {{ period.period.endtime}} </span>
            </h3>
            <div v-for="student in period.students" :key="student.id" class="period-student">
              <b-btn size="sm" @click="removeFromPeriod(period.period.id, student.studentid)">
                <b-icon font-scale="1" icon="trash" />
              </b-btn>
              {{ student.name }}
            </div>
          </drop>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { Drag, Drop } from 'vue-drag-drop'

export default {
  components: {
    Drag,
    Drop
  },
  async fetch () {
    await this.$axios.get('/api/admin/student').then((resp) => {
      this.students = resp.data
    })
  },
  data () {
    return {
      periods: [],
      students: [],
      dragging: null
    }
  },
  mounted () {
    this.loadTimePeriods()
  },
  methods: {
    async loadTimePeriods () {
      await this.$axios.get('/api/admin/timeperiod/students').then((resp) => {
        this.periods = resp.data
      })
    },
    async handleDrop (dragData, periodId) {
      const studentKey = dragData.studentKeyId
      // eslint-disable-next-line eqeqeq
      if (this.periods.filter(x => x.period.id == periodId)[0].students.filter(x => x.keyid == studentKey).length === 0) {
        const url = `/api/admin/timeperiod/${periodId}/${studentKey}`
        await this.$axios.post(url).then(() => {
          this.loadTimePeriods()
        })
      }
    },
    async removeFromPeriod (periodId, studentId) {
      const url = `/api/admin/timeperiod/${periodId}/${studentId}`
      await this.$axios.delete(url).then(() => {
        this.loadTimePeriods()
      })
    }
  }

}
</script>
