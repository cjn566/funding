<template>
  <b-container fluid>
    <b-row>
      <b-col>
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
