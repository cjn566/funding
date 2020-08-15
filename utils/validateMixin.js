
export default {
  methods: {
    validateState (vState, isSubmitted) {
      const { $dirty, $error } = vState
      // eslint-disable-next-line eqeqeq
      return ($dirty && (typeof (isSubmitted) == 'undefined' || isSubmitted === true)) ? !$error : null
    }
  }
}
