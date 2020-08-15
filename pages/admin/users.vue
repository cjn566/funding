<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Users
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-btn @click="addUser()">
          Add User
        </b-btn>
      </b-row>
      <b-row>
        <b-table :items="users" />
      </b-row>
    </b-form-group>

    <b-modal ref="user-modal" hide-footer title="Add User">
      <b-form-group>
        <b-input v-model="$v.userEmail.$model" :state="validateState($v.userEmail)" placeholder="Enter email address" />
      </b-form-group>
      <b-form-group>
        <b-input v-model="$v.userPassword.$model" :state="validateState($v.userPassword)" placeholder="Enter user password" />
      </b-form-group>
      <b-row>
        <b-col>
          <b-button block class="mt-3" variant="outline-danger" @click="cancelUser">
            Cancel
          </b-button>
        </b-col><b-col>
          <b-button block class="mt-3" variant="outline-success" @click="saveUser">
            Save
          </b-button>
        </b-col>
      </b-row>
    </b-modal>
  </b-container>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'

export default {
  mixins: [formatMixin, validateMixin],
  validations: {
    userEmail: {
      required, email
    },
    userPassword: {
      required
    }
  },
  data () {
    return {
      users: [],
      userEmail: null,
      userPassword: null
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    addUser () {
      this.$refs['user-modal'].show()
    },
    cancelUser () {
      this.userEmail = null
      this.userPassword = null
      this.$refs['user-modal'].hide()
    },
    async saveUser () {
      const url = '/api/admin/users/'
      const data = { email: this.userEmail, password: this.userPassword }
      await this.$axios.post(url, data)
        .then((response) => {
          this.cancelUser()
          this.loadList()
        })
    },
    async loadList () {
      const url = '/api/admin/users/'

      await this.$axios.get(url)
        .then((response) => {
          this.users = response.data
        })
    }
  }
}
</script>
