
const { DateTime } = require('luxon')

export default {
  methods: {
    formatDate (date, format) {
      // date is UTC, convert to local
      const dt = DateTime.fromISO(date)
      const dteStr = dt.toLocaleString(format || DateTime.DATETIME_SHORT)
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
