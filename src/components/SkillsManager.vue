<template>
  <div class="card">
    <h2>Skills</h2>

    <form @submit.prevent="createSkill" style="display:flex; gap:8px; margin-bottom:12px; align-items:center">
      <input v-model="newSkillName" placeholder="New skill name" required style="flex:1; padding:8px" />
      <button class="btn-primary" type="submit">Create</button>
    </form>

    <table class="skills-table">
      <thead>
        <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in skills" :key="s.id">
          <td>{{ s.id }}</td>
          <td>
            <div v-if="editingId === s.id">
              <input v-model="drafts[s.id]" />
            </div>
            <div v-else>
              {{ s.name }}
            </div>
          </td>
          <td>
            <div v-if="editingId === s.id">
              <button @click="saveEdit(s.id)">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </div>
            <div v-else>
              <button @click="startEdit(s)">Edit</button>
              <button @click="deleteSkill(s.id)">Delete</button>
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
  name: 'SkillsManager',
  data() {
    return { skills: [], newSkillName: '', editingId: null, drafts: {} }
  },
  async created() {
    await this.loadSkills()
  },
  methods: {
    async loadSkills() {
      try {
        const res = await api.get('/skills')
        this.skills = res.data || []
        this.skills.forEach(s => { if (this.drafts[s.id] === undefined) this.$set(this.drafts, s.id, s.name) })
      } catch (err) { console.error('load skills', err) }
    },
    async createSkill() {
      try {
        await api.post('/skills', { name: this.newSkillName })
        this.newSkillName = ''
        await this.loadSkills()
      } catch (err) { console.error('create skill', err); alert('Failed to create skill') }
    },
    startEdit(skill) { this.editingId = skill.id; this.$set(this.drafts, skill.id, skill.name) },
    cancelEdit() { this.editingId = null },
    async saveEdit(id) {
      try { const name = this.drafts[id]; await api.put(`/skills/${id}`, { name }); this.editingId = null; await this.loadSkills() }
      catch (err) { console.error('update skill', err); alert('Failed to update skill') }
    },
    async deleteSkill(id) {
      if (!confirm('Delete skill #' + id + '?')) return
      // optimistic remove from the UI so the app feels responsive
      const previous = [...this.skills]
      this.skills = this.skills.filter(s => s.id !== id)
      try {
        await api.delete(`/skills/${id}`)
        // cleanup draft if present
        try { this.$delete(this.drafts, id) } catch (e) { /* ignore if $delete unavailable */ }
        // try to refresh the list but don't show a failure to the user if refresh fails
        try { await this.loadSkills() } catch (err) { console.error('refresh after delete failed', err) }
      } catch (err) {
        // rollback UI and show an error only if the delete itself failed
        console.error('delete skill', err)
        this.skills = previous
        alert('Failed to delete skill')
      }
    }
  }
}
</script>

<style scoped>
.card { padding:18px; border-radius:10px; background:#fff }
.skills-table { width:100%; border-collapse:collapse }
.skills-table th, .skills-table td { border:1px solid #eee; padding:8px; text-align:left }
</style>
