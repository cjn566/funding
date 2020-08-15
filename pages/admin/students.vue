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
      <b-row>
        <b-btn @click="add()">
          Add Student
        </b-btn>
      </b-row>
      <b-row>
        <b-table :items="students" />
      </b-row>
    </b-form-group>

    <b-modal ref="entity-modal" hide-footer title="Add / Edit Student">
      <b-form-group>
        <b-input v-model="$v.student.name.$model" :state="validateState($v.student.name)" placeholder="Student Name" />
      </b-form-group>
      <b-form-group>
        This would ideally be uploaded as a block, and not manually entered here
        <b-input v-model="$v.student.key.$model" :state="validateState($v.student.key)" placeholder="Student Key (badge id)" />
      </b-form-group>
      <b-row>
        <b-col>
          <b-button block class="mt-3" variant="outline-danger" @click="cancel">
            Cancel
          </b-button>
        </b-col><b-col>
          <b-button block class="mt-3" variant="outline-success" @click="save">
            Save
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'

export default {
  mixins: [formatMixin, validateMixin],
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
      students: [],
      student: {
        name: null,
        key: null
      }
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    add () {
      this.$refs['entity-modal'].show()
    },
    cancel () {
      this.student = {
        name: null,
        key: null
      }
      this.$refs['entity-modal'].hide()
    },
    async save () {
      const url = '/api/admin/student/'
      await this.$axios.post(url, this.student)
        .then((response) => {
          this.cancel()
          this.loadList()
        })
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
