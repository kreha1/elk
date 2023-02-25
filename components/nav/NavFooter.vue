<script setup lang="ts">
const buildInfo = useBuildInfo()
const timeAgoOptions = useTimeAgoOptions()

const userSettings = useUserSettings()

const buildTimeDate = new Date(buildInfo.time)
const buildTimeAgo = useTimeAgo(buildTimeDate, timeAgoOptions)

const colorMode = useColorMode()
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <footer p4 text-sm text-secondary-light flex="~ col">
    <div flex="~ gap2" items-center mb4>
      <CommonTooltip :content="$t('nav.toggle_theme')">
        <button flex i-ri:sun-line dark-i-ri:moon-line text-lg :aria-label="$t('nav.toggle_theme')" @click="toggleDark()" />
      </CommonTooltip>
      <CommonTooltip :content="$t('nav.zen_mode')">
        <button
          flex
          text-lg
          :class="userSettings.zenMode ? 'i-ri:layout-right-2-line' : 'i-ri:layout-right-line'"
          :aria-label="$t('nav.zen_mode')"
          @click="userSettings.zenMode = !userSettings.zenMode"
        />
      </CommonTooltip>
    </div>
    <div>
      <i18n-t v-if="isHydrated" keypath="nav.built_at">
        <time :datetime="String(buildTimeDate)" :title="$d(buildTimeDate, 'long')">{{ buildTimeAgo }}</time>
      </i18n-t>
      <span v-else>
        {{ $t('nav.built_at', [$d(buildTimeDate, 'shortDate')]) }}
      </span>
      &middot;
      <span>{{ buildInfo.env }}</span>
      &middot;
      <NuxtLink
        external
        :href="`https://git.basil.cafe/basil/elk/commit/${buildInfo.commit}`"
        target="_blank"
        font-mono
      >
        {{ buildInfo.commit.slice(0, 7) }}
      </NuxtLink>
    </div>
    <div>
      <NuxtLink cursor-pointer hover:underline to="/settings/about">
        {{ $t('settings.about.label') }}
      </NuxtLink>
      <template v-if="$config.public.privacyPolicyUrl">
        &middot;
        <NuxtLink cursor-pointer hover:underline :to="$config.public.privacyPolicyUrl">
          {{ $t('nav.privacy') }}
        </NuxtLink>
      </template>
      &middot;
      <NuxtLink href="https://git.basil.cafe/basil/elk" target="_blank" external>
        Source
      </NuxtLink>
    </div>
  </footer>
</template>
