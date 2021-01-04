<template>
  <b-container>
    <b-form-group>
      <div v-if="isListMode">
        <b-row class="page-header">
          <b-col>
            <h1>
              Periods
            </h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" offset-md="2">
            <b-btn variant="info" @click="add()">
              Add New Period
            </b-btn>
          </b-col>
        </b-row>
        <b-row style="margin-top:20px">
          <b-col md="8" offset-md="2">
            <b-table
              :items="periods"
              :fields="fields"
              small
              borderless
              show-empty
            >
              <template v-slot:head(isActive)="data">
                <div class="text-center">
                  {{ data.label }}
                </div>
              </template>

              <template v-slot:cell(actions)="data">
                <b-btn size="sm" variant="danger" @click="deactivatePeriod(data.item)">
                  <b-icon font-scale="1" icon="trash" />
                </b-btn>
                <b-btn size="sm" variant="info" @click="toStudents(data.item)">
                  <b-icon font-scale="1" icon="pencil" />
                </b-btn>
              </template>
              <template v-slot:cell(isActive)="data">
                <div class="text-center">
                  {{ boolAsCheck(data.value) }}
                </div>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </div>

      <div v-if="isDeleteMode">
        <b-row class="page-header">
          <b-col>
            <h1>
              <b-btn variant="primary" @click="toList()">
                <b-icon icon="arrow-90deg-left" />
              </b-btn>
              Remove Period
            </h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6" offset-md="3">
            Are you sure you want to delete {{ period.periodName }}?  You cannot undo this.
          </b-col>
        </b-row>
        <b-row>
          <b-col md="3" offset-md="3">
            <b-button block class="mt-3" variant="danger" @click="cancel()">
              No
            </b-button>
          </b-col>
          <b-col md="3">
            <b-button block class="mt-3" variant="success" @click="saveDelete()">
              Yes
            </b-button>
          </b-col>
        </b-row>
      </div>

      <div v-if="isEditMode">
        <b-row class="page-header">
          <b-col>
            <h1>
              <b-btn variant="primary" @click="toList()">
                <b-icon icon="arrow-90deg-left" />
              </b-btn>
              Edit Period Name
            </h1>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6" offset-md="3">
            <b-form-group>
              <b-input v-model="$v.period.name.$model" :state="validateState($v.period.name)" placeholder="Period Name" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="3" offset-md="3">
            <b-button block class="mt-3" variant="danger" @click="cancel">
              Cancel
            </b-button>
          </b-col>
          <b-col md="3">
            <b-button block class="mt-3" variant="success" @click="save">
              Save
            </b-button>
          </b-col>
        </b-row>
      </div>

      <div v-if="isStudentMode">
        <b-row class="page-header">
          <b-col>
            <h1>
              <b-btn variant="primary" @click="toList()">
                <b-icon icon="arrow-90deg-left" />
              </b-btn>
              <b-btn variant="info" @click="toEditPeriod()">
                <b-icon icon="pencil" />
              </b-btn>
              {{ period.name }}
            </h1>
          </b-col>
        </b-row>
        <b-row style="margin-bottom:15px;">
          <b-col md="6">
            <b-btn variant="info" @click="upload()">
              Upload Students
            </b-btn>
          </b-col>
          <b-col md="6">
            <b-form-input ref="search" v-model="studentSearch" type="search" placeholder="Search for a student to add or remove" @keyup="search" />
          </b-col>
        </b-row>
        <b-row>
          <b-col md="6">
            Search results: Click 'add' to add a student to the period.
            <b-table
              borderless
              :items="searchResultDisplay"
              :fields="studentSearchFields"
              sort-icon-left
              :sort-by.sync="studentSortBy"
              :sort-desc.sync="studentSortDesc"
              small
              hover
              show-empty
              :empty-text="emptySearchText"
            >
              <template v-slot:cell(actions)="data">
                <div>
                  <b-btn size="sm" variant="info" @click="addStudentToPeriod(data.item)">
                    <b-icon font-scale="1" icon="person-plus" />
                  </b-btn>
                </div>
              </template>
            </b-table>
          </b-col>
          <b-col md="6">
            Students in period. Click 'remove' to remove the student from the period.
            <b-table
              :items="period.students"
              :fields="studentFields"
              sort-icon-left
              hover
              borderless
              :sort-by.sync="studentSortBy"
              :sort-desc.sync="studentSortDesc"
              :filter="studentSearch"
              small
              show-empty
              :empty-text="emptyPeriodStudentsText"
            >
              <template v-slot:cell(actions)="data">
                <div>
                  <b-btn size="sm" variant="danger" @click="removeStudentFromPeriod(data.item)">
                    <b-icon font-scale="1" icon="person-dash" />
                  </b-btn>
                </div>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </div>
      <div v-if="isUploadMode">
        <b-row class="page-header">
          <b-col>
            <h1>
              <b-btn variant="primary" @click="mode = 'student'">
                <b-icon icon="arrow-90deg-left" />
              </b-btn>
              Upload Students for {{ period.name }}
            </h1>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="8" offset-md="2">
            <b-form-group>
              <b-form-radio v-model="uploadType" name="upload-radios" value="add">
                <strong>Add students to period.</strong> <br>
                <span class="muted">This will add any students in the uploaded file to the period, ignoring duplicates.</span>
              </b-form-radio>
              <b-form-radio v-model="uploadType" ame="upload-radios" value="replace">
                <strong>Replace students in period.</strong>  <br>
                <span class="muted">This will remove all students from the period and replace them with the students in the uploaded file.</span>
              </b-form-radio>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" offset-md="2">
            <strong>Select the file you want to upload</strong><br>
            It must be a csv with each row in the following format: <br>
            <code>
              student_id,first_name,last_name<br>
              &lt;student_id&gt;,&lt;first_name&gt;,&lt;last_name&gt;<br>
              &lt;student_id&gt;,&lt;first_name&gt;,&lt;last_name&gt;<br>
              ...
            </code>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" offset-md="2">
            <b-form-group>
              <b-form-file
                v-model="file"
                accept=".csv"
                placeholder="Drop your match file here."
                drop-placeholder="Drop file here..."
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" offset-md="2">
            <b-button block class="mt-3" variant="info" @click="doUpload">
              Upload
            </b-button>
          </b-col>
        </b-row>
      </div>
    </b-form-group>
  </b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'
import messageMixin from '@/utils/messageMixin'

export default {
  mixins: [formatMixin, validateMixin, messageMixin],
  layout: 'admin',
  validations: {
    period: {
      name: {
        required
      }
    }
  },
  data () {
    return {
      mode: 'list',
      studentSearch: null,
      studentSortBy: 'lastName',
      studentSortDesc: true,
      searchResults: null,
      uploadType: 'add',
      periods: [],
      file: null,
      period: {
        id: null,
        name: null,
        isActive: null,
        students: null
      },
      fields: [
        {
          key: 'actions',
          label: '',
          sortable: false,
          tdClass: 'action-column',
          thStyle: 'width:90px'
        },
        {
          key: 'periodName',
          label: 'Name',
          sortable: false
        },
        {
          key: 'studentCount',
          label: '# Students',
          sortable: false
        }
      ],
      studentFields: [
        {
          key: 'actions',
          label: '',
          sortable: false,
          tdClass: 'action-column',
          thStyle: 'width:45px'
        },
        {
          key: 'key',
          label: 'Student ID',
          sortable: true
        },
        {
          key: 'lastName',
          label: 'Last Name',
          sortable: true
        },
        {
          key: 'firstName',
          label: 'First Name',
          sortable: false
        }
      ],
      studentSearchFields: [
        {
          key: 'actions',
          label: '',
          sortable: false,
          tdClass: 'action-column',
          thStyle: 'width: 45px'
        },
        {
          key: 'key',
          label: 'Student ID',
          sortable: true
        },
        {
          key: 'lastName',
          label: 'Last Name',
          sortable: true
        },
        {
          key: 'firstName',
          label: 'First Name',
          sortable: false
        }
      ]
    }
  },
  computed: {
    emptyPeriodStudentsText () {
      return (this.studentSearch && this.studentSearch.length > 0) ? 'No students match your search term' : 'There are no students in this period'
    },
    emptySearchText () {
      return (this.studentSearch && this.studentSearch.length > 0) ? 'No students match your search term' : 'Enter a search term to find students'
    },
    isNew () {
      return this.period.id == null
    },
    isListMode () {
      return this.mode === 'list'
    },
    isEditMode () {
      return this.mode === 'edit'
    },
    isUploadMode () {
      return this.mode === 'upload'
    },
    isStudentMode () {
      return this.mode === 'student'
    },
    isDeleteMode () {
      return this.mode === 'delete'
    },
    searchResultDisplay () {
      let stu = []
      if (this.searchResults != null && this.searchResults.length > 0) {
        const notInStuList = this.searchResults.filter(x => !this.period.students.map(y => y.id).includes(x.id)).map((x) => {
          return {
            id: x.id,
            firstName: x.firstName,
            key: x.key,
            lastName: x.lastName
          }
        })
        stu = notInStuList
      }
      return stu
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    toEditPeriod () {
      this.mode = 'edit'
    },
    toList () {
      this.period = {
        id: null,
        name: null,
        isActive: null,
        students: null
      }
      this.loadList()
      this.mode = 'list'
    },
    async search () {
      if (this.studentSearch.length > 0) {
        const url = `/api/admin/student/search/${this.studentSearch}`
        await this.$axios.get(url)
          .then((response) => {
            this.searchResults = response.data
          })
      }
      else {
        this.searchResults = null
      }
    },
    async fetchStudents () {
      const url = `/api/admin/timePeriod/${this.period.id}/students`
      await this.$axios.get(url)
        .then((response) => {
          this.period.students = response.data
        })
    },
    deactivatePeriod (item) {
      this.mode = 'delete'
      this.period = item
    },
    upload () {
      this.mode = 'upload'
    },
    toStudents (val) {
      this.$v.period.$reset()
      this.mode = 'student'
      this.searchResults = null
      this.studentSearch = null
      this.period.id = val.id
      this.period.name = val.periodName
      this.period.isActive = val.isActive
      this.fetchStudents()
    },
    add () {
      this.$v.period.$reset()
      this.mode = 'edit'
    },
    cancelUpload () {
      this.mode = 'edit'
    },
    cancel () {
      this.period = {
        id: null,
        name: null,
        isActive: null,
        students: null
      }
      this.mode = 'list'
    },
    deactivate () {
      this.period.isActive = false
      this.doSave()
    },
    save () {
      this.$v.period.$touch()
      if (!this.$v.period.$invalid) {
        if (this.periods.map(x => x.periodname).includes(this.period.name)) {
          this.showError('Duplicate', 'There is already a period with that name.')
        }
        else {
          this.doSave()
        }
      }
    },
    async saveDelete () {
      const url = `/api/admin/timePeriod/${this.period.id}/deactivate`
      await this.$axios.post(url)
        .then((response) => {
          this.cancel()
          this.loadList()
        })
    },
    async doSave () {
      const url = '/api/admin/timePeriod/'
      await this.$axios.post(url, this.period)
        .then((response) => {
          this.cancel()
          this.loadList()
        })
    },
    async loadList () {
      const url = '/api/admin/timePeriod/'

      await this.$axios.get(url)
        .then((response) => {
          this.periods = response.data
        })
    },
    async removeStudentFromPeriod (item) {
      const url = `/api/admin/timeperiod/${this.period.id}/${item.id}`
      await this.$axios.delete(url).then(() => {
        this.fetchStudents()
        this.$refs.search.$el.focus()
      })
    },
    async addStudentToPeriod (item) {
      const url = `/api/admin/timeperiod/${this.period.id}/${item.id}`
      await this.$axios.post(url).then(() => {
        this.searchResults = null
        this.studentSearch = ''
        this.fetchStudents()
        this.$refs.search.$el.focus()
      })
    },
    async deactivateTimePeriod (item) {
      const url = `/api/admin/timeperiod/${this.period.id}/deactivate`
      await this.$axios.post(url).then(() => {
        this.laodList()
        this.mode = 'list'
      })
    },
    async doUpload (env) {
      env.preventDefault()
      this.results = null

      if (this.file != null) {
        this.processing = true
        const url = `/api/admin/timePeriod/${this.period.id}/` + (this.uploadType === 'add' ? 'batchAdd' : 'batchReplace')

        const formData = new FormData()
        formData.append('file', this.file)

        await this.$axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then((response) => {
            this.file = null
            if (response.data.success === true) {
              this.showSuccess('Saved', `Students ${this.uploadType === 'add' ? 'added' : 'replaced'}.`)
              this.fetchStudents()
              this.mode = 'student'
            }
            else {
              this.showError('Error', response.data.failMessages)
            }
          })
          .catch((ex) => {
            alert('Something didn\'t work as expected. Please let the developers know.')
          })
      }
      else {
        this.showError('Error', 'Please select a file to upload (only one).')
      }
    }
  }
}
</script>
