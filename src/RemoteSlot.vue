<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { loadRemoteModule } from '@softarc/native-federation-runtime';
import type { RemoteConfig } from '@bimo-dk/nexus-core';

const props = defineProps<{ remote: RemoteConfig; compact?: boolean }>();
const container = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
let teardown: (() => void) | null = null;

onMounted(async () => {
  try {
    const mod = (await loadRemoteModule({
      remoteEntry: props.remote.url,
      exposedModule: props.remote.exposedModule,
    })) as Record<string, unknown>;
    if (typeof mod['mount'] === 'function' && container.value) {
      const result = (mod['mount'] as (el: HTMLElement) => void | (() => void))(container.value);
      if (typeof result === 'function') teardown = result;
    } else {
      error.value = 'Remote does not export mount(el)';
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
});
onBeforeUnmount(() => { teardown?.(); });
</script>

<template>
  <div class="slot" :class="{ compact }">
    <div v-if="error" class="err">{{ error }}</div>
    <div v-else ref="container" />
  </div>
</template>

<style scoped>
.slot { padding: 16px; }
.slot.compact { padding: 8px; max-height: 220px; overflow: hidden; }
.err { color: #b91c1c; font-size: 12px; padding: 8px; background: #fee2e2; border-radius: 6px; }
</style>
