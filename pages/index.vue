<template>
  <b-container>
    <b-row style="margin-top:20px" class="page-header">
      <b-col>
        <h1 style="padding-top:12px">
          Welcome to Keycard Access
        </h1>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-input v-model="keyVal" placeholder="Enter keycard value (scan)" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-btn variant="info" @click="go()">
          Go
        </b-btn>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  data () {
    return {
      keyVal: null
    }
  },
  methods: {
    go () {
      const url = `/api/student/${this.keyVal}`
      this.$axios.get(url).then((resp) => {
        console.log(resp.data)
      })
    }
  }
}
</script>
