<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="isLoggedIn" md="2" class="menu-sidebar">
        <b-btn block to="/admin/users" style="margin-top: 120px;">
          Users
        </b-btn>
        <b-btn block to="/admin/periods">
          Periods
        </b-btn>
        <b-btn block to="/admin/bellSchedule">
          Bell Schedule
        </b-btn>
        <b-btn block to="/admin/students">
          Students
        </b-btn>
        <b-btn block to="/admin/studentPeriods">
          Student Periods
        </b-btn>
        <b-btn block to="/admin/reports">
          Reports
        </b-btn>
        <b-btn block @click="logOut()">
          Log Out
        </b-btn>
      </b-col>
      <b-col md="2" />
      <b-col md="10">
        <main>
          <nuxt />
        </main>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  computed: {
    isLoggedIn () {
      return this.$auth.loggedIn
    }
  },
  methods: {
    logOut () {
      this.$auth.logout()
    }
  }
}
</script>
