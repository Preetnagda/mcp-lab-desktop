import { Server, Tool } from '../shared/models'
import { getServer, getServers as getServersFromDb } from './db'
import { MCPClient } from './mcp/client'
import { getClient, storeClient } from './session-store'

export async function getServers(): Promise<Server[]> {
  return getServersFromDb()
}

export async function getTools(serverId: number): Promise<Tool[] | null> {
  let client = getClient(serverId)
  if (!client) {
    const server = getServer(serverId)
    if (!server) return null
    client = new MCPClient()
    const connected = await client.connectToServer(server)
    if (connected.code != 200) {
      if (connected.code == 401) {
        //TODO: Perform OAuth flow
      }
      return null
    }
    storeClient(serverId, client)
  }

  return await client.listTools()
}
