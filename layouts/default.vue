<template>
  <b-container fluid>
    <b-row>
      <b-col md="4" lg="3" xl="2" class="menu-sidebar">
        <b-btn block href="/admin/users" style="margin-top: 30px;">
          Users
        </b-btn>
        <b-btn block href="/admin/periods">
          Periods
        </b-btn>
        <b-btn block href="/admin/students">
          Students
        </b-btn>
        <b-btn block href="/admin/studentPeriods">
          Student Periods
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
}
</script>
