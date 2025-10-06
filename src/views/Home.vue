<template>
  <div class="home">
    <div class="header">
      <h1>Welcome</h1>
        <div class="controls">
          <button v-if="isLoggedIn" class="btn-logout" @click="disconnect">Logout</button>
          <button @click="goToSkills">Skills</button>
          <!-- <button @click="goToUsers">Users</button> -->
          <button @click="goToTasks">Tasks</button>
          <button v-if="isLoggedIn" @click="goToProfile">My Profile</button>
        </div>
    </div>

    <p>This is the home page. Protected pages can set <code>meta.requiresAuth = true</code> in the router.</p>
    <p v-if="userId">Logged in as userId: {{ userId }}</p>
    <!-- Navigation controls only; skills are managed on the dedicated Skills page -->
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Home',
  data() {
    return {}
  },
  computed: {
    userId() {
      return localStorage.getItem('userId')
    },
    isLoggedIn() {
      return !!(localStorage.getItem('xsrfToken') && localStorage.getItem('userId'))
    }
  },
  created() {
    // Home is lightweight; skill/task management moved to dedicated pages
  },
  methods: {
    async disconnect() {
      try {
        await api.post('/users/sign_out')
      } catch (err) {
        // ignore server errors on logout
      }
      localStorage.removeItem('xsrfToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('roleId')
      this.$router.push({ name: 'SignIn' })
    }
    ,
    goToSkills() { this.$router.push({ name: 'Skills' }) },
    goToSkill(id) { if (!id) return; this.$router.push({ name: 'SkillDetails', params: { skillId: id } }) },
    goToProfile() { this.$router.push({ name: 'Profile' }) },
    goToUsers() { this.$router.push({ name: 'Users' }) },
    goToTasks() { this.$router.push({ name: 'Tasks' }) },
    goToTask(id) { if (!id) return; this.$router.push({ name: 'TaskEdit', params: { taskId: id } }) }
  }
}
</script>

<style scoped>
.home { padding: 24px }
.header { display:flex; align-items:center; justify-content:space-between; gap:12px }
.btn-logout { background: #fff; border:1px solid #e6e9ef; padding:6px 10px; border-radius:8px; cursor:pointer }
</style>
