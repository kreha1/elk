import { getNodeInfo } from '~~/server/shared'

export default defineEventHandler(async (event) => {
  const { server } = getRouterParams(event)
  return getNodeInfo(server)
})
