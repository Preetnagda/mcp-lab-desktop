import { ApiResponse, RegisterServer, Server, Tool, TransportConfig } from '../shared/models'
import { getServer, getServers as getServersFromDb, writeServer } from './storage/mcp-servers-store'
import { MCPClient } from './mcp/client'
import { getAllClients, getClient, storeClient } from './storage/session-store'
import { notifyServersUpdated } from './events'
import { randomUUID } from 'node:crypto'

function failure(error: unknown): { ok: false; message: string } {
  return { ok: false, message: error instanceof Error ? error.message : String(error) }
}

export async function getServers(): Promise<ApiResponse<Server[]>> {
  try {
    const allClients = getAllClients()
    return {
      ok: true,
      data: getServersFromDb().map((server) => {
        return {
          ...server,
          toolCount: allClients[server.id]?.toolCount,
          connected: allClients[server.id]?.connected
        }
      })
    }
  } catch (error) {
    return failure(error)
  }
}

export async function getServerDetails(serverId: string): Promise<ApiResponse<Server>> {
  try {
    const server = getServer(serverId)
    if (!server) return { ok: false, message: 'Server not found' }
    const client = getClient(serverId)
    return {
      ok: true,
      data: {
        ...server,
        toolCount: client?.toolCount,
        connected: client?.connected
      }
    }
  } catch (error) {
    return failure(error)
  }
}

export async function getTools(serverId: string): Promise<ApiResponse<Tool[]>> {
  try {
    const server = getServer(serverId)
    if (!server) return { ok: false, message: 'Server not found' }
    let client = getClient(serverId)
    if (!client) {
      client = new MCPClient()
    }
    if (!client.connected) {
      const connection = await client.connectToServer(server)
      storeClient(serverId, client)
      if (!connection.connected) {
        if (connection.authPending) {
          return { ok: false, message: 'Authorization required — complete the sign-in window' }
        }
        return { ok: false, message: connection.message ?? 'Failed to connect to server' }
      }
      notifyServersUpdated()
    }
    return { ok: true, data: (await client.listTools()) ?? [] }
  } catch (error) {
    return failure(error)
  }
}

export async function registerServer(server: RegisterServer): Promise<ApiResponse<string>> {
  try {
    try {
      new URL(server.url)
    } catch {
      return { ok: false, message: 'Invalid server URL' }
    }
    const existing = getServersFromDb().find((registered) => registered.url === server.url)
    if (existing) {
      return {
        ok: false,
        message: `A server with this URL is already registered (${existing.name})`
      }
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
    return { ok: true, data: id }
  } catch (error) {
    return failure(error)
  }
}
