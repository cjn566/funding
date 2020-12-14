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
      <div v-if="!isEditing">
        <b-row>
          <b-btn @click="add()">
            Add Student
          </b-btn>
        </b-row>
        <b-row>
          <b-table
            :items="students"
            :fields="fields"
            hover
            small
            show-empty
            @row-clicked="editStudent"
          />
        </b-row>
      </div>
      <div v-if="isEditing">
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.student.name.$model" :state="validateState($v.student.name)" placeholder="Student Name" />
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
        <b-row v-if="$v.student.$anyDirty">
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
      name: {
        required
      },
      key: {
        required
      }
    }
  },
  data () {
    return {
      isEditing: false,
      students: [],
      student: {
        id: null,
        name: null,
        key: null
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
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
    isNew () {
      return this.student.id == null
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    resetStudent () {
      this.student.id = null
      this.student.name = null
      this.student.key = null
    },
    add () {
      this.$v.student.$reset()
      this.isEditing = true
      this.resetStudent()
    },
    cancel () {
      this.resetStudent()
      this.isEditing = false
    },
    editStudent (val) {
      this.$v.student.$reset()
      this.student.id = val.id
      this.student.name = val.name
      this.student.key = val.key
      this.isEditing = true
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
    }
  }
}
</script>
