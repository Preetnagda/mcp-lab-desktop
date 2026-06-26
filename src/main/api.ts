import { ApiResponse, Server, Tool } from '../shared/models'
import { getServer, getServers as getServersFromDb } from './storage/mcp-servers-store'
import { MCPClient } from './mcp/client'
import { getAllClients, getClient, storeClient } from './storage/session-store'

export async function getServers(): Promise<ApiResponse<Server[]>> {
  console.log('Fetching servers')
  const allClients = getAllClients()
  return {
    error: false,
    data: getServersFromDb().map((server) => {
      return {
        ...server,
        toolCount: allClients[server.id]?.toolCount,
        connected: allClients[server.id]?.connected
      }
    })
  }
}

export async function getTools(serverId: string): Promise<ApiResponse<Tool[]>> {
  const response: ApiResponse<Tool[]> = {
    error: false,
    data: []
  }
  let client = getClient(serverId)
  const server = getServer(serverId)
  if (!server)
    return {
      error: true,
      data: [],
      message: 'Server not found'
    }
  if (!client) {
    client = new MCPClient()
  }
  if (!client.connected) {
    const connected = await client.connectToServer(server)
    storeClient(serverId, client)
    response.error = connected.connected
    if (connected.authPending) {
      response.message = 'Pending OAuth Flow'
    }
  }
  if (!response.error) {
    response.data = (await client.listTools()) ?? []
  }

  return response
}
