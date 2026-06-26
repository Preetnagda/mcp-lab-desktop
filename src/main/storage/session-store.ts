import { MCPClient } from '../mcp/client'

interface SessionStoreInterface {
  clients: {
    [serverId: string]: MCPClient
  }
}

const store: SessionStoreInterface = {
  clients: {}
}

export function getClient(serverId: string): MCPClient | null {
  if (serverId in store.clients) {
    console.log('Found existing client')
    return store.clients[serverId]
  }
  return null
}

export function getAllClients(): { [serverId: string]: MCPClient } {
  return store.clients
}

export function getClients(serverIds: string[]): { [serverId: string]: MCPClient } {
  const clients: { [serverId: string]: MCPClient } = {}
  for (const serverId of serverIds) {
    if (serverId in store.clients) {
      clients[serverId] = store.clients[serverId]
    }
  }
  return clients
}

export function storeClient(serverId: string, client: MCPClient): boolean {
  store.clients[serverId] = client
  return true
}
