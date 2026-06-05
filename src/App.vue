<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { nexus } from './nexus';
</script>

<template>
  <div class="layout">
    <div v-if="!nexus.online" class="offline-banner">
      <strong>Registry offline</strong> — remotes unavailable until reconnected.
    </div>

    <header class="topbar">
      <div class="brand">
        <span class="dot" />
        <strong>Nexus Host (Vue)</strong>
      </div>
      <nav class="topnav">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink
          v-for="r in nexus.remotes"
          :key="r.name"
          :to="`/${r.routePath}`"
        >{{ r.name }}</RouterLink>
      </nav>
      <div class="meta">
        <span class="pill" :class="nexus.online ? 'online' : 'offline'">
          Registry {{ nexus.online ? 'online' : 'offline' }}
        </span>
      </div>
    </header>

    <div class="body">
      <aside class="sidebar">
        <h3>Remotes</h3>
        <p v-if="nexus.remotes.length === 0" class="empty">No active remotes.</p>
        <ul>
          <li v-for="r in nexus.remotes" :key="r.name">
            <RouterLink :to="`/${r.routePath}`" active-class="active">
              <span class="dot-status" />
              {{ r.name }}
            </RouterLink>
          </li>
        </ul>
        <template v-if="nexus.failed.size > 0">
          <h4>Failed</h4>
          <ul class="failed">
            <li v-for="[name, err] in nexus.failed" :key="name" :title="err">
              <span class="dot-status down" />
              {{ name }}
            </li>
          </ul>
        </template>
      </aside>

      <main class="content">
        <RouterView />
      </main>
    </div>

    <footer class="bottombar">
      <small>Nexus host (Vue) — {{ nexus.remotes.length }} remotes loaded</small>
    </footer>
  </div>
</template>

<style scoped>
.layout { display: flex; flex-direction: column; height: 100vh; }
.offline-banner {
  flex: 0 0 auto;
  background: #fef3c7;
  color: #78350f;
  padding: 10px 20px;
  border-bottom: 1px solid #fbbf24;
  font-size: 13px;
}
.topbar {
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 24px;
  background: var(--host-surface);
  border-bottom: 1px solid var(--host-border);
}
.brand { display: flex; align-items: center; gap: 10px; font-size: 16px; color: var(--host-text); }
.brand .dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--host-primary);
}
.topnav { display: flex; gap: 16px; flex: 1; }
.topnav a {
  color: var(--host-text-muted);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
}
.topnav a.router-link-active { color: var(--host-primary-dark); background: #eef2ff; }
.meta .pill {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  background: #f1f5f9;
  color: var(--host-text-muted);
}
.meta .pill.online { background: #dcfce7; color: #166534; }
.meta .pill.offline { background: #fee2e2; color: #991b1b; }
.body { display: grid; grid-template-columns: 240px 1fr; flex: 1 1 auto; min-height: 0; }
.sidebar {
  background: var(--host-surface);
  border-right: 1px solid var(--host-border);
  padding: 16px;
  overflow-y: auto;
}
.sidebar h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--host-text-muted);
  margin: 0 0 8px;
}
.sidebar h4 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--health-down);
  margin: 16px 0 8px;
}
.empty { color: var(--host-text-muted); font-size: 13px; }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li { margin-bottom: 4px; }
.sidebar a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  color: var(--host-text);
  text-decoration: none;
  font-size: 14px;
}
.sidebar a:hover { background: #f1f5f9; }
.sidebar a.active { background: #eef2ff; color: var(--host-primary-dark); }
.failed li { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 13px; color: var(--health-down); }
.dot-status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--health-unknown);
  flex-shrink: 0;
}
.dot-status.down { background: var(--health-down); }
.content { padding: 24px; overflow-y: auto; }
.bottombar {
  flex: 0 0 32px;
  background: var(--host-surface);
  border-top: 1px solid var(--host-border);
  padding: 0 24px;
  display: flex;
  align-items: center;
  color: var(--host-text-muted);
  font-size: 12px;
}
</style>
