
const groupBy = require('lodash.groupby')

export default class StudentService {
  constructor (studentRepo, timePeriodRepo, logger) {
    this.studentRepo = studentRepo
    this.timePeriodRepo = timePeriodRepo
    this.logger = logger
  }

  async checkAccess (studentKey) {
    const hasAccess = await this.studentRepo.checkAccess(studentKey)
    return hasAccess
  }

  async getList () {
    const list = await this.studentRepo.getStudents(null)
    return list
  }

  async deleteStudent (id) {
    await this.studentRepo.deleteStudent(id)
  }

  async batchCreateStudents (students, addMissingIgnoreDupes) {
    // check for duplicate keys within the file, return error if so
    const keys = groupBy(students, 'key')
    let messages = []
    for (const prop in keys) {
      const val = keys[prop]
      if (val.length > 1) {
        messages.push(`Key ${prop} is duplicated in this file.`)
      }
    }

    if (messages.length === 0) {
    // check for duplicate keys against active students in the database
      const dupeCheckerPromises = students.map(async (stu) => {
        stu.duplicate = await this.studentRepo.checkDuplicateKey(null, stu.key)
      })

      await Promise.all(dupeCheckerPromises).then(() => {
        if (addMissingIgnoreDupes) {
          students = students.filter(x => x.duplicate === false)
        }
        else {
          messages = students.filter(x => x.duplicate === true).map(x =>
            `Key ${x.key} is already associated with a student.`
          )
        }
      })
    }

    // if no errors, save the student record
    if (messages.length === 0) {
      for (const student of students) {
        await this.saveStudent(null, student.first, student.last, student.key)
      }
    }

    return messages
  }

  async saveStudent (id, firstName, lastName, key, periods) {
    const isDupe = await this.studentRepo.checkDuplicateKey(id, key)
    if (!periods) {
      periods = []
    }

    if (!isDupe) {
      if (id != null) {
        await this.studentRepo.update(id, firstName, lastName, key)
      }
      else {
        id = await this.studentRepo.add(firstName, lastName, key)
      }
      const stuRec = (await this.studentRepo.getStudents(id))[0]
      for (const per of periods) {
        if (!stuRec.periods.includes(per)) {
          this.timePeriodRepo.addStudentToPeriodById(per, stuRec.id)
        }
      }
      for (const per in stuRec.periods) {
        if (!periods.includes(per.id)) {
          this.timePeriodRepo.deleteStudentFromPeriod(per, stuRec.id)
        }
      }
    }

    return !isDupe
  }

  async search (term) {
    return await this.studentRepo.search(term)
  }
}
