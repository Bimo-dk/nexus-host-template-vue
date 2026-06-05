<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { nexus } from './nexus';
</script>

<template>
  <section class="dashboard">
    <h2>Welcome to the Nexus host shell</h2>
    <p class="lead">Select a remote in the sidebar to load a micro frontend.</p>

    <div v-if="nexus.remotes.length === 0" class="empty">
      <h3>No remotes registered yet</h3>
      <p>
        Host receives updates via WebSocket. Add a remote via the portal at
        <code>http://localhost:8669</code>.
      </p>
    </div>

    <template v-else>
      <div class="stats">
        <article class="card">
          <span class="label">Loaded remotes</span>
          <strong>{{ nexus.remotes.length }}</strong>
        </article>
        <article class="card">
          <span class="label">Failed remotes</span>
          <strong>{{ nexus.failed.size }}</strong>
        </article>
        <article class="card">
          <span class="label">Registry</span>
          <strong :class="nexus.online ? 'online' : 'offline'">
            {{ nexus.online ? 'Online' : 'Offline (cache)' }}
          </strong>
        </article>
      </div>

      <h3>Available remotes</h3>
      <ul class="remote-list">
        <li v-for="r in nexus.remotes" :key="r.name">
          <RouterLink :to="`/${r.routePath}`">
            <strong>{{ r.name }}</strong>
            <code>/{{ r.routePath }}</code>
          </RouterLink>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.dashboard { padding: 8px; }
h2 { margin: 0 0 4px; color: var(--host-text); }
.lead { color: var(--host-text-muted); margin: 0 0 24px; }
h3 { margin: 24px 0 12px; font-size: 16px; color: var(--host-text); }
.empty {
  padding: 32px;
  background: var(--host-surface);
  border: 1px dashed var(--host-border);
  border-radius: 12px;
  text-align: center;
  color: var(--host-text-muted);
}
.empty h3 { margin: 0 0 8px; color: var(--host-text); }
.empty code { background: #eef2ff; padding: 2px 6px; border-radius: 4px; color: var(--host-primary-dark); }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.card {
  background: var(--host-surface);
  border: 1px solid var(--host-border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.card .label { font-size: 12px; color: var(--host-text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.card strong { font-size: 24px; margin-top: 4px; }
.card strong.online { color: var(--health-healthy); }
.card strong.offline { color: var(--health-down); }
.remote-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.remote-list a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--host-surface);
  border: 1px solid var(--host-border);
  border-radius: 10px;
  color: var(--host-text);
  text-decoration: none;
  transition: border-color 0.15s;
}
.remote-list a:hover { border-color: var(--host-primary); }
.remote-list code { color: var(--host-text-muted); font-size: 13px; margin-left: auto; }
</style>
