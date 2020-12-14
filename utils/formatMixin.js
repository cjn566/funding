
const { DateTime } = require('luxon')

export default {
  methods: {
    formatDate (date, delimeter) {
      // TODO: something funky is happening here, we are not getting the actual pacific timezone date properly
      // date is UTC, convert to local
      const dt = DateTime.fromISO(date, { zone: 'Asia/Hong_Kong' }) // this is wrong, based on node doing funky tz conversation stuff when coming out of db. Needs to be figure out and fixed
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
