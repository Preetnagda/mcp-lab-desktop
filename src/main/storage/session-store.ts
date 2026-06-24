import { MCPClient } from '../mcp/client'

interface SessionStoreInterface {
  clients: {
    [serverId: number]: MCPClient
  }
}

const store: SessionStoreInterface = {
  clients: {}
}

export function getClient(serverId: number): MCPClient | null {
  if (serverId in store.clients) {
    console.log('Found existing client')
    return store.clients[serverId]
  }
  return null
}

export function storeClient(serverId: number, client: MCPClient): boolean {
  store.clients[serverId] = client
  return true
}
