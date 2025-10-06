<template>
  <div class="register card">
    <h2>Sign Up</h2>
    <form class="form" @submit.prevent="signUp">
      <div class="field">
        <label for="name">First name</label>
        <input id="name" v-model="name" type="text" required />
      </div>

      <div class="field">
        <label for="surname">Last name</label>
        <input id="surname" v-model="surname" type="text" required />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <div class="field">
        <label for="role">Role</label>
        <select id="role" v-model="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button class="btn-primary" type="submit">Register</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Registration',
  data() {
    return {
      name: '',
      surname: '',
      email: '',
      password: '',
      role: 'user',
      error: null
    }
  },
  methods: {
    async signUp() {
      this.error = null
      try {
        // Send raw password to server; server should handle hashing/salting.
        // Phoenix controllers commonly expect a `user` key, e.g. %{"user" => %{...}}
        const payload = {
          user: {
            email: this.email,
            name: this.name,
            surname: this.surname,
            role: this.role,
            password: this.password
          }
        }

        const res = await api.post('/users/sign_up', payload)
        const data = res.data || {}

        // If backend returns xsrf token and user id, store them and go Home
        if (data.xsrf_token || data.xsrfToken || data.id || data.userId) {
          const xsrf = data.xsrf_token || data.xsrfToken
          const userId = data.id || data.userId
          const roleId = data.role || data.roleId
          if (xsrf) localStorage.setItem('xsrfToken', xsrf)
          if (userId) localStorage.setItem('userId', String(userId))
          if (roleId) localStorage.setItem('roleId', String(roleId))
          this.$router.push({ name: 'Home' })
        } else if (res.status === 201 || res.status === 200) {
          // fallback: if server returned success status but no body, go Home
          this.$router.push({ name: 'Home' })
        } else {
          this.error = 'Registration failed.'
        }
      } catch (err) {
        // If server responded with validation errors (HTTP 422), format them
        const resp = err.response?.data
        if (err.response?.status === 422 && resp) {
          if (resp.errors && typeof resp.errors === 'object') {
            const parts = []
            for (const [k, v] of Object.entries(resp.errors)) {
              const msgs = Array.isArray(v) ? v.join(', ') : String(v)
              parts.push(`${k} ${msgs}`)
            }
            this.error = parts.join('; ')
          } else if (resp.error) {
            this.error = resp.error
          } else {
            this.error = JSON.stringify(resp)
          }
        } else {
          this.error = err.response?.data?.message || err.message || 'Registration failed.'
        }
      }
    }
  }
}
</script>

<style scoped>
.card { max-width: 520px; margin: 32px auto; background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 8px 28px rgba(20,30,60,0.06) }
.register { max-width: 520px; margin: 0 }
.form { display:grid; gap:12px }
.field { display:flex; flex-direction:column }
.field label { font-size:13px; color:#5b6b80; margin-bottom:6px }
.field input, .field select { height:44px; padding:8px 12px; border-radius:8px; border:1px solid #d7e0ef }
.btn-primary { margin-top:6px; height:46px; width:100%; border:none; border-radius:10px; background:linear-gradient(90deg,#4b6bff,#6ad0ff); color:#fff; font-weight:600 }
.error { margin-top:12px; color:#b83a3a; font-weight:600 }
</style>
