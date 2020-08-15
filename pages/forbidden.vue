<template>
  <b-container>
    <b-row style="margin-top:20px" class="page-header">
      <b-col>
        <h1 style="padding-top:12px">
          Unauthorized
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        Uh oh! You don't have permisssion to do that.
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  layout: 'admin',
  mounted () {
    if (this.$permissions.length < 1) {
      this.$auth.logout()
      this.$router.go()
    }
  }
}
</script>
