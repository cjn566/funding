<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Students
          </h1>
        </b-col>
      </b-row>
      <div v-if="isListing">
        <b-row>
          <b-col md="8" offset-md="2">
            <b-btn variant="info" @click="add()">
              Add Student
            </b-btn>
            <b-btn variant="info" @click="upload()">
              Upload Student File
            </b-btn>
          </b-col>
          <b-col md="8" offset-md="2">
            <b-form-input v-model="filter" type="search" placeholder="Type to search" style="margin-top:10px;" />
          </b-col>
        </b-row>
        <b-row style="margin-top:10px">
          <b-col md="8" offset-md="2">
            <b-table
              :items="students"
              :fields="fields"
              :filter="filter"
              small
              show-empty
              sort-icon-left
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
            >
              <template v-slot:cell(actions)="data">
                <div style="width:200px">
                  <b-btn size="sm" variant="primary" @click="editStudent(data.item)">
                    <b-icon font-scale="1" icon="eye" />
                  </b-btn>
                  <b-btn size="sm" variant="danger" @click="deleteStudent(data.item)">
                    <b-icon font-scale="1" icon="trash" />
                  </b-btn>
                </div>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </div>
      <div v-if="isEditing">
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.student.firstName.$model" :state="validateState($v.student.firstName)" placeholder="First Name" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.student.lastName.$model" :state="validateState($v.student.lastName)" placeholder="Last Name" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.student.key.$model" :state="validateState($v.student.key)" placeholder="Student ID (badge ID)" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-checkbox-group
              v-model="student.periods"
              :options="periodDisplay"
              name="periods"
              stacked
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancel">
              Cancel
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="save">
              Save
            </b-button>
          </b-col>
        </b-row>
      </div>

      <div v-if="isDeleting">
        <b-row>
          <b-col md="4" offset-md="4">
            Are you sure you want to delete {{ student.firstName }} {{ student.lastName }} ({{ student.key }})?
          </b-col>
        </b-row>
        <b-row>
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancel">
              No
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="confirmDelete">
              Yes
            </b-button>
          </b-col>
        </b-row>
      </div>

      <div v-if="isUploading">
        <b-row>
          <b-col md="8" offset-md="2">
            Select the file you want to upload. It must be a csv with each row in the format:
            <code>
              student_id,first_name,last_name<br>
              &lt;student_id&gt;,&lt;first_name&gt;,&lt;last_name&gt; <br>
              &lt;student_id&gt;,&lt;first_name&gt;,&lt;last_name&gt; <br>
              ...
            </code>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="8" offset-md="2">
            <b-form-group>
              <b-form-file
                v-model="files"
                accept=".csv"
                multiple
                placeholder="Drop your match file here."
                drop-placeholder="Drop file here..."
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancel">
              Cancel
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="doUpload">
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
  layout: 'admin',
  mixins: [formatMixin, validateMixin, messageMixin],
  validations: {
    student: {
      firstName: {
        required
      },
      lastName: {
        required
      },
      key: {
        required
      }
    }
  },
  async fetch () {
    const url = '/api/admin/timePeriod/'
    await this.$axios.get(url)
      .then((response) => {
        this.periods = response.data
      })
  },
  data () {
    return {
      files: [],
      processing: false,
      periods: [],
      mode: 'list',
      students: [],
      sortBy: 'lastName',
      sortDesc: false,
      filter: null,
      student: {
        id: null,
        firstName: null,
        lastName: null,
        key: null,
        periods: []
      },
      fields: [
        {
          key: 'actions',
          label: '',
          sortable: false,
          tdClass: 'action-column',
          thStyle: { width: '85px' }
        },
        {
          key: 'lastName',
          label: 'Last',
          sortable: true
        },
        {
          key: 'firstName',
          label: 'First',
          sortable: true
        },
        {
          key: 'key',
          label: 'Student ID',
          sortable: true
        }
      ]
    }
  },
  computed: {
    periodDisplay () {
      return this.periods.map((x) => {
        return {
          value: x.id,
          text: x.periodName
        }
      })
    },
    isEditing () {
      return this.mode === 'edit'
    },
    isDeleting () {
      return this.mode === 'delete'
    },
    isUploading () {
      return this.mode === 'upload'
    },
    isListing () {
      return this.mode === 'list'
    },
    isNew () {
      return this.student.id == null
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    upload () {
      this.mode = 'upload'
    },
    deleteStudent (val) {
      this.student = val
      this.mode = 'delete'
    },
    resetStudent () {
      this.student = {
        id: null,
        firstName: null,
        lastName: null,
        key: null,
        periods: []
      }
    },
    add () {
      this.$v.student.$reset()
      this.mode = 'edit'
      this.resetStudent()
    },
    cancel () {
      this.resetStudent()
      this.mode = 'list'
    },
    editStudent (val) {
      this.$v.student.$reset()
      this.student.id = val.id
      this.student.firstName = val.firstName
      this.student.lastName = val.lastName
      this.student.key = val.key
      this.student.periods = val.periods
      this.mode = 'edit'
    },
    async confirmDelete () {
      const url = `/api/admin/student/${this.student.id}/delete`
      await this.$axios.patch(url)
        .then((response) => {
          this.showSuccess('Deleted', 'Student record deleted.')
          this.cancel()
          this.loadList()
        })
    },
    async save () {
      this.$v.student.$touch()
      if (!this.$v.student.$invalid) {
        const url = '/api/admin/student/'
        await this.$axios.post(url, this.student)
          .then((response) => {
            if (response.data === true) {
              this.showSuccess('Saved', 'Student record saved.')
              this.cancel()
              this.loadList()
            }
            else {
              this.showError('Error', 'Duplicate student id detected.')
            }
          })
      }
    },
    async loadList () {
      const url = '/api/admin/student/'

      await this.$axios.get(url)
        .then((response) => {
          this.students = response.data
        })
    },
    async doUpload (env) {
      env.preventDefault()
      this.results = null

      if (this.files.length === 1) {
        this.processing = true
        const url = '/api/admin/student/batch'

        const formData = new FormData()
        formData.append('file', this.files[0])

        await this.$axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then((response) => {
            this.files = null
            if (response.data.success === true) {
              this.showSuccess('Saved', 'Students added.')
              this.loadList()
              this.mode = 'list'
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
