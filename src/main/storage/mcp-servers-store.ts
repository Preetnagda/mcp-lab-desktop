import { Server } from '../../shared/models'
import { getFileData, writeFileData } from './file-storage-layer'

const SERVERS_FILENAME = 'server-store.json'

export function getServer(serverId: string): Server | null {
  const rawServers = getFileData(SERVERS_FILENAME)
  if (rawServers) {
    const servers = JSON.parse(rawServers)
    if (serverId in servers) return servers[serverId]
  }
  return null
}

export function getServers(): Server[] {
  let servers = []
  const rawServers = getFileData(SERVERS_FILENAME)
  if (rawServers) {
    servers = JSON.parse(rawServers)
  }
  return Object.values(servers)
}

export async function writeServer(server: Server): Promise<void> {
  const rawServers = getFileData(SERVERS_FILENAME)
  const servers = rawServers ? JSON.parse(rawServers) : {}
  servers[server.id] = {
    id: server.id,
    name: server.name,
    transportConfig: server.transportConfig,
    url: server.url
  }
  await writeFileData(JSON.stringify(servers), SERVERS_FILENAME)
}
