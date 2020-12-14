
export default {
  methods: {
    showError (title, message) {
      this.$bvToast.toast(message, {
        title,
        autoHideDelay: 5000,
        variant: 'danger',
        solid: true,
        appendToast: false,
        toaster: 'b-toaster-bottom-right'
      })
    },
    showSuccess (title, message) {
      this.$bvToast.toast(message, {
        title,
        autoHideDelay: 5000,
        variant: 'success',
        solid: true,
        appendToast: false,
        toaster: 'b-toaster-bottom-right'
      })
    }
  }
}
