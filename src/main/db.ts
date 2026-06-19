import { Server } from '../shared/models'

const servers: { [serverId: number]: Server } = {
  1: {
    id: 1,
    name: 'Cloudflare Docs',
    transportConfig: {
      type: 'HTTP',
      options: {}
    },
    url: 'https://docs.mcp.cloudflare.com/mcp'
  },
  2: {
    id: 2,
    name: 'Notion MCP',
    transportConfig: {
      type: 'HTTP',
      options: {}
    },
    url: 'https://mcp.notion.com/mcp'
  }
}

export function getServer(serverId: number): Server | null {
  if (serverId in servers) return servers[serverId]
  return null
}

export function getServers(): Server[] {
  return Object.values(servers)
}
