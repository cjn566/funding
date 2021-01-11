<template>
  <b-container>
    <b-form-group>
      <b-row class="page-header">
        <b-col>
          <h1>
            Admin Login
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="4" offset-md="4">
          <b-form @submit.prevent="userLogin">
            <b-form-group>
              <b-input v-model="$v.login.email.$model" placeholder="Email" :state="validateState($v.login.email)" />
            </b-form-group>
            <b-form-group>
              <b-input v-model="$v.login.password.$model" placeholder="Password" type="password" :state="validateState($v.login.password)" />
            </b-form-group>
            <b-form-group>
              <b-btn type="submit" size="lg" variant="info" block>
                Login
              </b-btn>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </b-form-group>
  </b-container>
</template>

<script>

import { required } from 'vuelidate/lib/validators'
import validateMixin from '@/utils/validateMixin'

export default {
  auth: false,
  mixins: [validateMixin],
  validations: {
    login: {
      email: {
        required
      },
      password: {
        required
      }
    }
  },
  data () {
    return {
      login: {
        email: '',
        password: ''
      },
      error: null
    }
  },
  computed: {
    hasError () {
      return this.error != null
    }
  },
  methods: {
    async userLogin () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        const ret = await this.$auth.loginWith('local', { data: this.login })
        if (ret.data.success === true) {
          this.$auth.setUser({ email: this.login.email })
          this.$router.push('/admin/reports')
        }
        else {
          this.$bvToast.toast('Invalid credentials', {
            title: 'Login Error',
            autoHideDelay: 5000,
            variant: 'danger',
            solid: true,
            appendToast: false,
            toaster: 'b-toaster-top-right'
          })
        }
      }
    }
  }
}
</script>
