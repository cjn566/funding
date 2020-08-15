<template>
  <b-container>
    <b-row style="margin-top:20px">
      <b-col>
        <b-alert show variant="danger">Unauthorized or authorization expired, logging out</b-alert>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  layout: 'admin',
  mounted () {
    this.$auth.logout()
    this.$router.go()
  }
}
</script>
