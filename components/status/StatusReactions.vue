<script setup lang="ts">
import type { ExtendedStatus } from 'composables/masto/status'

const props = defineProps<{
  status: ExtendedStatus
}>()

const {
  status,
  isLoading,
  toggleReaction,
} = $(useStatusActions(props))

watch(() => status.emojiReactions, (x) => {
  // eslint-disable-next-line no-console
  console.log('watching', x)
}, { deep: true })
</script>

<template>
  <div v-if="status.emojiReactions" flex items-center gap-1>
    <button
      v-for="reaction in status.emojiReactions"
      :key="reaction.name"
      flex row items-center gap-2
      px-2 py-1
      rounded
      transition-all
      :class="reaction.me ? 'bg-primary-fade hover:bg-primary-light' : 'hover:bg-dark'"
      :disabled="isLoading.emoji[reaction.name]"
      @click="toggleReaction(reaction)"
    >
      <img
        v-if="reaction.url" :src="reaction.url"
        h-6 w-6
      >
      <ContentRich
        v-else
        h-6 w-6
        :content="reaction.name"
      />
      <!-- TODO: Change to the component with the smooth transition & CommonLocalizedNumber -->
      <span>{{ reaction.count }}</span>
    </button>
  </div>
</template>
