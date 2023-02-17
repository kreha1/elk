export default defineEventHandler(async (event) => {
  const { server } = getRouterParams(event)
  return getNodeInfo(server)
})
