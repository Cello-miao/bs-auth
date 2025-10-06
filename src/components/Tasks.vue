<template>
  <div class="card">
    <h2>Tasks</h2>

    <form @submit.prevent="create" class="form" style="display:flex; gap:8px; margin-bottom:12px; align-items:center">
      <input v-model="newTask.title" placeholder="Title" required style="flex:1; padding:8px" />
      <input v-model="newTask.description" placeholder="Description" style="flex:2; padding:8px" />
      <button class="btn-primary" type="submit">Create Task</button>
    </form>

    <table class="tasks-table">
      <thead>
        <tr><th>ID</th><th>Title</th><th>Description</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="t in tasks" :key="t.id">
          <td>{{ t.id }}</td>
          <td>
            <div v-if="editingId === t.id">
              <input v-model="drafts[t.id].title" />
            </div>
            <div v-else>
              {{ t.title }}
            </div>
          </td>
          <td>
            <div v-if="editingId === t.id">
              <input v-model="drafts[t.id].description" />
            </div>
            <div v-else>
              {{ t.description }}
            </div>
          </td>
          <td>
            <div v-if="editingId === t.id">
              <select v-model="drafts[t.id].status">
                <option>todo</option>
                <option>in_progress</option>
                <option>done</option>
              </select>
            </div>
            <div v-else>
              {{ t.status }}
            </div>
          </td>
          <td>
            <div v-if="editingId === t.id">
              <button type="button" @click="saveEdit(t.id)">Save</button>
              <button type="button" @click="cancelEdit">Cancel</button>
            </div>
            <div v-else>
              <button type="button" @click="startEdit(t)">Edit</button>
              <button type="button" @click="deleteTask(t.id)">Delete</button>
              <button type="button" v-if="isAuth" @click="assign(t.id)">Assign to me</button>
              <button type="button" v-if="isAuth" @click="withdraw(t.id)">Withdraw</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Tasks',
  data() { return { tasks: [], newTask: { title: '', description: '' }, editingId: null, drafts: {} } },
  computed: {
    isAuth() { return !!(localStorage.getItem('xsrfToken') && localStorage.getItem('userId')) }
  },
  async created() { await this.load() },
  methods: {
    async load() {
      try {
        const res = await api.get('/tasks')
        this.tasks = res.data || []
        // prepare drafts for inline editing
        this.tasks.forEach(t => {
          if (this.drafts[t.id] === undefined) {
            // assign directly so Vue 3's proxy reactivity picks it up
            this.drafts[t.id] = { title: t.title, description: t.description, status: t.status }
          }
        })
      } catch (err) { console.error('load tasks', err) }
    },
    async create() {
      try {
        // send flat params expected by the backend (title, description)
        await api.post('/tasks', { title: this.newTask.title, description: this.newTask.description })
        this.newTask = { title: '', description: '' }
        await this.load()
      } catch (err) { console.error('create task', err); alert('Failed to create task') }
    },
    startEdit(task) {
      this.editingId = task.id
      // ensure draft exists for this task
      this.drafts[task.id] = { title: task.title, description: task.description, status: task.status }
    },
    cancelEdit() { this.editingId = null },
    async saveEdit(id) {
      try {
        // send flat params for update (title, description, status)
        const d = this.drafts[id] || {}
        const payload = { title: d.title, description: d.description, status: d.status }
        await api.put(`/tasks/${id}`, payload)
        this.editingId = null
        await this.load()
      } catch (err) { console.error('update task', err); alert('Failed to update task') }
    },
    async deleteTask(id) {
      if (!confirm('Delete task #' + id + '?')) return
      // optimistic UI update
      const previous = [...this.tasks]
      this.tasks = this.tasks.filter(t => t.id !== id)
      try {
        await api.delete(`/tasks/${id}`)
        try {
          // delete key in a way that preserves reactivity
          const nd = { ...this.drafts }
          delete nd[id]
          this.drafts = nd
        } catch (e) { /* ignore */ }
        // attempt to refresh but don't surface refresh errors as delete failures
        try { await this.load() } catch (err) { console.error('refresh after delete failed', err) }
      } catch (err) {
        console.error('delete task', err)
        this.tasks = previous
        alert('Failed to delete task')
      }
    },
    async assign(id) { try { await api.post(`/tasks/${id}/assign`); await this.load() } catch (err) { console.error('assign', err); alert('Failed to assign') } },
    async withdraw(id) { try { await api.post(`/tasks/${id}/withdraw`); await this.load() } catch (err) { console.error('withdraw', err); alert('Failed to withdraw') } }
  }
}
</script>

<style scoped>
.card{padding:18px}
.form { display:flex; gap:8px; margin-bottom:12px }
.tasks-table { width:100%; border-collapse:collapse }
.tasks-table th, .tasks-table td { border:1px solid #eee; padding:8px; text-align:left }
</style>
