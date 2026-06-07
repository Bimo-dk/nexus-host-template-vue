import { reactive, defineComponent, h, onBeforeUnmount, onMounted, ref, type Component } from 'vue';
import type { Router } from 'vue-router';
import { RegistryClient, RegistryWebSocket } from '@bimo-dk/nexus-client';
import { loadRemoteModule } from '@softarc/native-federation-runtime';
import type { RemoteConfig } from '@bimo-dk/nexus-core';

declare global {
  interface Window {
    __NEXUS_GATEWAY_CONFIG__?: { registryUrl?: string };
  }
}

export const registryUrl =
  window.__NEXUS_GATEWAY_CONFIG__?.registryUrl ??
  import.meta.env.VITE_REGISTRY_URL ??
  '/api';

export const token = import.meta.env.VITE_NEXUS_TOKEN ?? '';

export const nexus = reactive({
  remotes: [] as RemoteConfig[],
  failed: new Map<string, string>(),
  online: false,
});

const registered = new Set<string>();

/**
 * Generic wrapper component that hosts a remote. It owns a `<div>` and
 * delegates rendering to the remote's `mount(el)` if present (Bring
 * Your Own Framework — the remote brings its own Vue/React/Angular
 * runtime and creates its own root), or falls back to rendering the
 * default-exported Vue component for legacy remotes.
 */
function createRemoteHostComponent(remote: RemoteConfig): Component {
  return defineComponent({
    name: `RemoteHost:${remote.name}`,
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      const legacyComp = ref<Component | null>(null);
      const errorMsg = ref<string | null>(null);
      let teardown: (() => void) | null = null;

      onMounted(async () => {
        try {
          const mod = (await loadRemoteModule({
            remoteEntry: remote.url,
            exposedModule: remote.exposedModule,
          })) as Record<string, unknown>;

          if (typeof mod['mount'] === 'function' && containerRef.value) {
            teardown = (mod['mount'] as (el: HTMLElement) => () => void)(containerRef.value);
            return;
          }

          const fallback = (mod['default'] ?? Object.values(mod)[0]) as Component;
          if (fallback) {
            legacyComp.value = fallback;
          } else {
            errorMsg.value = 'Remote exposed neither mount() nor a default component';
          }
        } catch (err) {
          errorMsg.value = err instanceof Error ? err.message : String(err);
          nexus.failed.set(remote.name, errorMsg.value);
        }
      });

      onBeforeUnmount(() => { teardown?.(); });

      return () => {
        if (errorMsg.value) {
          return h('div', { style: 'padding:24px;color:#b91c1c;' }, [
            h('strong', null, 'Remote failed to mount: '),
            errorMsg.value,
          ]);
        }
        if (legacyComp.value) return h(legacyComp.value);
        return h('div', { ref: containerRef });
      };
    },
  });
}

export function registerRemoteRoutes(router: Router, remotes: RemoteConfig[]): void {
  let added = false;
  for (const remote of remotes) {
    if (!remote.enabled || registered.has(remote.name)) continue;
    registered.add(remote.name);
    added = true;

    const component = createRemoteHostComponent(remote);
    router.addRoute({ path: `/${remote.routePath}`, component });
    nexus.remotes.push(remote);
  }
  // If we just added routes that match the current URL, re-navigate so
  // Vue Router picks up the new route table. Deep-linking to /<routePath>
  // before the registry payload arrives would otherwise stay on the
  // unmatched-route placeholder forever.
  if (added) {
    void router.replace(router.currentRoute.value.fullPath);
  }
}

export function connectRegistry(router: Router): void {
  const client = new RegistryClient({ registryUrl, token });
  const ws = new RegistryWebSocket({ registryUrl, token });

  ws.onMessage(msg => {
    // Registry sends 'welcome' on connect (with current remote list)
    // and 'remotes_changed' on every subsequent change. The old
    // ('connected' / 'registry_updated') names predate AUDIT_REPORT
    // BUG-6 and only survived in the published @bimo-dk packages.
    if (msg.type === 'welcome' || msg.type === 'remotes_changed') {
      nexus.online = true;
      // Defensive: published @bimo-dk/nexus-client@0.1.0 surfaced an
      // alternate payload shape that produced `undefined` here, which
      // crashed the host on the first WS frame. Skip gracefully.
      if (Array.isArray(msg.remotes)) {
        registerRemoteRoutes(router, msg.remotes);
      }
    }
  });

  client.getRemotes()
    .then(remotes => {
      nexus.online = true;
      registerRemoteRoutes(router, remotes);
    })
    .catch(() => { nexus.online = false; });

  ws.connect();
}
