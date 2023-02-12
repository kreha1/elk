import fs from 'unstorage/drivers/fs'
import memory from 'unstorage/drivers/memory'
import kv from 'unstorage/drivers/cloudflare-kv-http'

import { $fetch } from 'ofetch'
import type { Storage } from 'unstorage'

import cached from '../cache-driver'

// @ts-expect-error virtual import
import { driver } from '#storage-config'

import type { AppInfo } from '~/types'

const storage = useStorage() as Storage

if (driver === 'fs') {
  const config = useRuntimeConfig()
  storage.mount('servers', fs({ base: config.storage.fsBase }))
}
else if (driver === 'cloudflare') {
  const config = useRuntimeConfig()
  storage.mount('servers', cached(kv({
    accountId: config.cloudflare.accountId,
    namespaceId: config.cloudflare.namespaceId,
    apiToken: config.cloudflare.apiToken,
  })))
}
else if (driver === 'memory') {
  storage.mount('servers', memory())
}

export function getRedirectURI(origin: string, server: string) {
  origin = origin.replace(/\?.*$/, '')
  return `${origin}/api/${server}/oauth/${encodeURIComponent(origin)}`
}

async function fetchAppInfo(origin: string, server: string) {
  const app: AppInfo = await $fetch(`https://${server}/api/v1/apps`, {
    method: 'POST',
    body: {
      client_name: 'Elk (Basil\'s fork)',
      website: 'https://elk.basil.cafe',
      redirect_uris: getRedirectURI(origin, server),
      scopes: 'read write follow push',
    },
  })
  return app
}

export async function getApp(origin: string, server: string) {
  const host = origin.replace(/^https?:\/\//, '').replace(/[^\w\d]/g, '-').replace(/\?.*$/, '')
  const key = `servers:v3:${server}:${host}.json`.toLowerCase()

  try {
    if (await storage.hasItem(key))
      return await storage.getItem(key) as Promise<AppInfo>
    const appInfo = await fetchAppInfo(origin, server)
    await storage.setItem(key, appInfo)
    return appInfo
  }
  catch {
    return null
  }
}

export async function deleteApp(server: string) {
  const keys = (await storage.getKeys(`servers:v3:${server}:`))
  for (const key of keys)
    await storage.removeItem(key)
}

export async function listServers() {
  const keys = await storage.getKeys('servers:v3:')
  const servers = new Set<string>()
  for await (const key of keys) {
    const id = key.split(':')[2]
    if (id)
      servers.add(id.toLocaleLowerCase())
  }
  return Array.from(servers).sort()
}

export async function getNodeInfo(host: string) {
  const key = `servers:v2:nodeinfo:${host}`.toLowerCase()

  switch (host) {
    case 'misskey.io':
    case 'mk.absturztau.be':
      return 'misskey'
  }

  try {
    if (await storage.hasItem(key))
      return await storage.getItem(key) as Promise<AppInfo>

    const wellKnownRes = await fetch(`https://${host}/.well-known/nodeinfo`)
    const wellKnown = await wellKnownRes.json()
    const link = wellKnown.links[0].href
    const nodeInfoRes = await fetch(link)
    const nodeInfo = await nodeInfoRes.json()
    const software = nodeInfo.software.name

    await storage.setItem(key, software)
    return software
  }
  catch {
    return 'none'
  }
}
