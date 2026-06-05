import { reactive } from 'vue';
import { defineAsyncComponent, type Component } from 'vue';
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

export function registerRemoteRoutes(router: Router, remotes: RemoteConfig[]): void {
  for (const remote of remotes) {
    if (!remote.enabled || registered.has(remote.name)) continue;
    registered.add(remote.name);

    const component = defineAsyncComponent({
      loader: () =>
        (loadRemoteModule({ remoteEntry: remote.url, exposedModule: remote.exposedModule }) as Promise<Record<string, unknown>>)
          .then(mod => ({ default: (mod['default'] ?? Object.values(mod)[0]) as Component })),
      onError(err) {
        nexus.failed.set(remote.name, err instanceof Error ? err.message : String(err));
      },
    });

    router.addRoute({ path: `/${remote.routePath}`, component });
    nexus.remotes.push(remote);
  }
}

export function connectRegistry(router: Router): void {
  const client = new RegistryClient({ registryUrl, token });
  const ws = new RegistryWebSocket({ registryUrl, token });

  ws.onMessage(msg => {
    if (msg.type === 'connected' || msg.type === 'registry_updated') {
      nexus.online = true;
      registerRemoteRoutes(router, msg.remotes);
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
