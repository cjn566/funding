<template>
  <b-container fluid>
    <b-row>
      <b-col md="2" class="menu-sidebar">
        <b-btn block to="/reports">
          Reports
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
  },
  methods: {
  }
}
</script>
