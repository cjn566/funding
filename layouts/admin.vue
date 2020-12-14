<template>
  <b-container fluid>
    <b-row>
      <b-col v-if="isLoggedIn" md="4" lg="3" xl="2" class="menu-sidebar">
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
        <b-btn block @click="logOut()">
          Log Out
        </b-btn>
      </b-col>
      <b-col md="4" lg="3" xl="2" />
      <b-col md="8" lg="9" xl="10">
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
