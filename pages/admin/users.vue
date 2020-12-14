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
      <div v-if="!isAdding && !isEditing">
        <b-row>
          <b-table
            :items="users"
            :fields="fields"
            hover
            outlined
            small
            show-empty
            @row-clicked="editUser"
          >
            <template v-slot:head(is_active)="data">
              <div class="text-center">
                {{ data.label }}
              </div>
            </template>
            <template v-slot:head(last_login)="data">
              <div class="text-right">
                {{ data.label }}
              </div>
            </template>

            <template v-slot:cell(is_active)="data">
              <div class="text-center">
                {{ boolAsCheck(data.value) }}
              </div>
            </template>
            <template v-slot:cell(last_login)="data">
              <div class="text-right">
                {{ data.value ? formatDate(data.value) : '-' }}
              </div>
            </template>
          </b-table>
        </b-row>
      </div>
      <div v-if="isChangingPassword">
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.passwordChange.one.$model" type="password" :state="validateState($v.passwordChange.one)" placeholder="New password" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.passwordChange.two.$model" type="password" :state="validateState($v.passwordChange.two)" placeholder="Confirm the new password" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancelPwChange">
              Cancel
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="savePwChange">
              Save
            </b-button>
          </b-col>
        </b-row>
      </div>
      <div v-if="(isAdding || isEditing) && !isChangingPassword">
        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.user.first.$model" :state="validateState($v.user.first)" placeholder="Enter first name" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.user.last.$model" :state="validateState($v.user.last)" placeholder="Enter last name" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.user.email.$model" :state="validateState($v.user.email)" placeholder="Enter email address" />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row v-if="!isEditing">
          <b-col md="4" offset-md="4">
            <b-form-group>
              <b-input v-model="$v.user.password.$model" type="password" :state="validateState($v.user.password)" placeholder="Enter user password" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row v-if="!$v.user.$anyDirty">
          <b-col md="2" offset-md="4">
            <b-button v-if="user.isActive" block class="mt-3" variant="danger" @click="disable()">
              Disable User
            </b-button>
            <b-button v-if="!user.isActive" block class="mt-3" variant="danger" @click="enable()">
              Enable User
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="warning" @click="changePassword()">
              Change Password
            </b-button>
          </b-col>
        </b-row>
        <b-row v-if="$v.user.$anyDirty">
          <b-col md="2" offset-md="4">
            <b-button block class="mt-3" variant="danger" @click="cancelUser">
              Cancel
            </b-button>
          </b-col>
          <b-col md="2">
            <b-button block class="mt-3" variant="success" @click="saveUser">
              Save
            </b-button>
          </b-col>
        </b-row>
      </div>
    </b-form-group>
  </b-container>
</template>

<script>
import { required, email, requiredIf, sameAs } from 'vuelidate/lib/validators'
import formatMixin from '@/utils/formatMixin'
import validateMixin from '@/utils/validateMixin'

export default {
  layout: 'admin',
  mixins: [formatMixin, validateMixin],
  validations: {
    user: {
      first: {
        required
      },
      last: {
        required
      },
      email: {
        required, email
      },
      password: {
        required: requiredIf(function () {
          return this.isAdding
        })
      }
    },
    passwordChange: {
      one: {
        required
      },
      two: {
        sameAsPassword: sameAs('one')
      }
    }
  },
  data () {
    return {
      users: [],
      isAdding: false,
      isChangingPassword: false,
      passwordChange: {
        one: null,
        two: null
      },
      user: {
        id: null,
        email: null,
        password: null,
        first: null,
        last: null,
        isActive: null
      },
      fields: [
        {
          key: 'email',
          label: 'Email',
          sortable: true
        },
        {
          key: 'first_name',
          label: 'First Name',
          sortable: false
        },
        {
          key: 'last_name',
          label: 'Last Name',
          sortable: false
        },
        {
          key: 'is_active',
          label: 'Active',
          sortable: false
        },
        {
          key: 'last_login',
          label: 'Last Login',
          sortable: true
        }
      ]
    }
  },
  computed: {
    isEditing () {
      return this.user.id != null
    }
  },
  mounted () {
    this.loadList()
  },
  methods: {
    cancelPwChange () {
      this.isChangingPassword = false
      this.passwordChange = {
        one: null,
        two: null
      }
    },
    async savePwChange () {
      this.$v.passwordChange.$touch()
      if (!this.$v.passwordChange.$invalid) {
        const url = `/api/admin/users/${this.user.id}/password`
        await this.$axios.patch(url, { password: this.passwordChange.one })
          .then((response) => {
            this.$bvToast.toast('Password updated.', {
              title: 'Success',
              autoHideDelay: 5000,
              variant: 'success',
              solid: true,
              appendToast: false,
              toaster: 'b-toaster-bottom-right'
            })
            this.cancelPwChange()
            this.cancelUser()
            this.resetUser()
            this.loadList()
          })
      }
    },
    changePassword () {
      this.isChangingPassword = true
    },
    editUser (record, idx) {
      this.user.id = record.id
      this.user.first = record.first_name
      this.user.last = record.last_name
      this.user.email = record.email
      this.user.isActive = record.is_active
    },
    addUser () {
      this.isAdding = true
      this.$v.$reset()
    },
    cancelUser () {
      this.resetUser()
      this.isAdding = false
    },
    resetUser () {
      this.user = {
        id: null,
        email: null,
        password: null,
        first: null,
        last: null,
        isActive: null
      }
    },
    async saveUser () {
      this.$v.user.$touch()

      if (!this.$v.user.$invalid) {
        const url = '/api/admin/users/'
        await this.$axios.post(url, this.user)
          .then((response) => {
            this.cancelUser()
            this.resetUser()
            this.loadList()
            if (response.data === false) {
              this.$bvToast.toast('Duplicate email address, cannot create.', {
                title: 'Error',
                autoHideDelay: 5000,
                variant: 'danger',
                solid: true,
                appendToast: false,
                toaster: 'b-toaster-bottom-right'
              })
            }
          })
      }
    },
    async loadList () {
      const url = '/api/admin/users/'

      await this.$axios.get(url)
        .then((response) => {
          this.users = response.data
        })
    },
    async disable () {
      if (this.$auth.user.email === this.user.email) {
        this.$bvToast.toast('You can\'t disable your own account.', {
          title: 'Error',
          autoHideDelay: 5000,
          variant: 'danger',
          solid: true,
          appendToast: false,
          toaster: 'b-toaster-bottom-right'
        })
      }
      else {
        const url = `/api/admin/users/${this.user.id}/disable`
        await this.$axios.patch(url, this.user)
          .then((response) => {
            this.$bvToast.toast(`${this.user.email}'s account is disabled.`, {
              title: 'User Disabled',
              autoHideDelay: 5000,
              variant: 'success',
              solid: true,
              appendToast: false,
              toaster: 'b-toaster-bottom-right'
            })
            this.cancelUser()
            this.resetUser()
            this.loadList()
          })
      }
    },
    async enable () {
      const url = `/api/admin/users/${this.user.id}/enable`
      await this.$axios.patch(url, this.user)
        .then((response) => {
          this.$bvToast.toast(`${this.user.email}'s account is enabled.`, {
            title: 'User Enabled',
            autoHideDelay: 5000,
            variant: 'success',
            solid: true,
            appendToast: false,
            toaster: 'b-toaster-bottom-right'
          })
          this.cancelUser()
          this.resetUser()
          this.loadList()
        })
    }
  }
}
</script>
