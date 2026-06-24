import { Server } from '../../shared/models'

const dbServers: { [serverId: number]: Server } = {
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
  },
  3: {
    id: 3,
    name: 'Test MCP',
    transportConfig: {
      type: 'HTTP',
      options: {}
    },
    url: 'http://localhost:3000'
  }
}

export function getServer(serverId: number): Server | null {
  if (serverId in dbServers) return dbServers[serverId]
  return null
}

export function getServers(): Server[] {
  return Object.values(dbServers)
}
