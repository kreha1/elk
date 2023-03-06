import type { mastodon } from 'masto'

type Action = 'reblogged' | 'favourited' | 'bookmarked' | 'pinned' | 'muted'
type CountField = 'reblogsCount' | 'favouritesCount'

export interface Reaction {
  accountIds: string[]
  count: number
  me: boolean
  name: string
  url: string | null
}

export type ExtendedStatus = mastodon.v1.Status & {
  emojiReactions?: Reaction[]
}

export interface StatusActionsProps {
  status: ExtendedStatus
}

export function useStatusActions(props: StatusActionsProps) {
  let status = $ref<ExtendedStatus>({ ...props.status })
  const { client } = $(useMasto())

  watch(
    () => props.status,
    val => status = { ...val },
    { deep: true, immediate: true },
  )

  // Use different states to let the user press different actions right after the other
  const isLoading = $ref({
    reblogged: false,
    favourited: false,
    bookmarked: false,
    pinned: false,
    translation: false,
    muted: false,
    emoji: {} as Record<string, true>,
  })

  async function toggleStatusAction(action: Action, fetchNewStatus: () => Promise<mastodon.v1.Status>, countField?: CountField) {
    // check login
    if (!checkLogin())
      return

    const prevCount = countField ? status[countField] : undefined

    isLoading[action] = true
    const isCancel = status[action]
    fetchNewStatus().then((newStatus) => {
      // when the action is cancelled, the count is not updated highly likely (if they're the same)
      // issue of Mastodon API
      if (isCancel && countField && prevCount === newStatus[countField])
        newStatus[countField] -= 1

      Object.assign(status, newStatus)
      cacheStatus(newStatus, undefined, true)
    }).finally(() => {
      isLoading[action] = false
    })
    // Optimistic update
    status[action] = !status[action]
    cacheStatus(status, undefined, true)
    if (countField)
      status[countField] += status[action] ? 1 : -1
  }

  const canReblog = $computed(() =>
    status.visibility !== 'direct'
    && (status.visibility !== 'private' || status.account.id === currentUser.value?.account.id),
  )

  const toggleReblog = () => toggleStatusAction(
    'reblogged',
    () => client.v1.statuses[status.reblogged ? 'unreblog' : 'reblog'](status.id).then((res) => {
      if (status.reblogged)
      // returns the original status
        return res.reblog!
      return res
    }),
    'reblogsCount',
  )

  const toggleFavourite = () => toggleStatusAction(
    'favourited',
    () => client.v1.statuses[status.favourited ? 'unfavourite' : 'favourite'](status.id),
    'favouritesCount',
  )

  const toggleBookmark = () => toggleStatusAction(
    'bookmarked',
    () => client.v1.statuses[status.bookmarked ? 'unbookmark' : 'bookmark'](status.id),
  )

  const togglePin = async () => toggleStatusAction(
    'pinned',
    () => client.v1.statuses[status.pinned ? 'unpin' : 'pin'](status.id),
  )

  const toggleMute = async () => toggleStatusAction(
    'muted',
    () => client.v1.statuses[status.muted ? 'unmute' : 'mute'](status.id),
  )

  const toggleReaction = async (reaction: {
    name: string
    me: boolean
  }) => {
    const url = `https://${currentUser.value?.server}/api/v1/pleroma/statuses/${status.id}/reactions/${encodeURIComponent(reaction.name)}`

    isLoading.emoji[reaction.name] = true
    client.http[reaction.me ? 'delete' : 'put'](url).then((newStatus) => {
      Object.assign(status, newStatus)
      cacheStatus(newStatus as ExtendedStatus, undefined, true)
    }).finally(() => {
      delete isLoading.emoji[reaction.name]
    })
  }

  return {
    status: $$(status),
    isLoading: $$(isLoading),
    canReblog: $$(canReblog),
    toggleMute,
    toggleReblog,
    toggleFavourite,
    toggleBookmark,
    togglePin,
    toggleReaction,
  }
}
