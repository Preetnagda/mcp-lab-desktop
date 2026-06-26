import { ApiResponse, RegisterServer, Server, Tool, TransportConfig } from '../shared/models'
import { getServer, getServers as getServersFromDb, writeServer } from './storage/mcp-servers-store'
import { MCPClient } from './mcp/client'
import { getAllClients, getClient, storeClient } from './storage/session-store'
import { randomUUID } from 'node:crypto'

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

export async function registerServer(server: RegisterServer): Promise<ApiResponse<string>> {
  const response: ApiResponse<string> = {
    error: true,
    data: ''
  }

  const id = randomUUID()
  const transportConfig: TransportConfig = {
    type: 'HTTP',
    options: {}
  }

  await writeServer({
    id,
    transportConfig,
    name: server.name,
    url: server.url
  })
  response.error = false
  response.data = id
  return response
}
