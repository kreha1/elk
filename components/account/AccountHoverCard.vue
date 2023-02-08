<script setup lang="ts">
import type { mastodon } from 'masto'

const { account } = defineProps<{
  account: mastodon.v1.Account
}>()

const { t } = useI18n()

const relationship = $(useRelationship(account))
const hasHeader = $computed(() => !account.header.endsWith('/original/missing.png'))
const showHoverBanner = usePreferences('showHoverBanner')

function previewHeader() {
  openMediaPreview([{
    id: `${account.acct}:header`,
    type: 'image',
    previewUrl: account.header,
    description: t('account.profile_description', [account.username]),
  }])
}
</script>

<template>
  <div v-show="relationship" flex="~ col" rounded min-w-90 max-w-120 z-100 overflow-hidden>
    <button v-if="showHoverBanner && hasHeader" border="b base" z-1 @click="previewHeader()">
      <img h-25 height="100" w-full object-cover :src="account.header" :alt="t('account.profile_description', [account.username])">
    </button>
    <div p-4 flex="~ col gap2">
      <div flex="~ gap2" items-center>
        <NuxtLink :to="getAccountRoute(account)" flex-auto rounded-full hover:bg-active transition-100 pe5 me-a>
          <AccountInfo :account="account" />
        </NuxtLink>
        <AccountFollowButton text-sm :account="account" :relationship="relationship" />
      </div>
      <div v-if="account.note" max-h-100 overflow-y-auto>
        <ContentRich text-4 text-secondary :content="account.note" :emojis="account.emojis" />
      </div>
      <AccountPostsFollowers text-sm :account="account" />
    </div>
  </div>
</template>
