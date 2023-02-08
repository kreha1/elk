<script setup lang="ts">
import type { mastodon } from 'masto'

const { account } = defineProps<{
  account: mastodon.v1.Account
}>()

const data = ref<null | string>(null);
(async () => {
  data.value = await getServerIcon(account)
})()
</script>

<template>
  <!-- Note, does not handle unsupported servers -->
  <img v-if="data !== 'none' && data !== null" :src="`/software/${data}.svg`" h-1rem inline-block rd-4px ms-4px relative bottom-1px>
</template>
