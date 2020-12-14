
const { DateTime } = require('luxon')

export default {
  methods: {
    formatDate (date, delimeter) {
      // TODO: something funky is happening here, we are not getting the actual pacific timezone date properly
      // date is UTC, convert to local
      const dt = DateTime.fromISO(date)
      const dteStr = dt.toLocaleString(DateTime.DATETIME_SHORT)
      return dteStr
    },
    boolToString (val) {
      return val === true ? 'Yes' : 'No'
    },
    upperCaseFirstLetter (val) {
      return val.charAt(0).toUpperCase() + val.slice(1)
    },
    boolAsCheck (val) {
      return val === true ? '✔' : '×'
    }
  }
}
