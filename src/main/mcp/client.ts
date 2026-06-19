import { Client } from '@modelcontextprotocol/sdk/client'
import { Server, Tool } from '../../shared/models'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'

export class MCPClient {
  private client: Client

  constructor() {
    this.client = new Client({
      name: 'mcp-lab',
      version: '1.0'
    })
  }

  getClient(): Client {
    return this.client
  }

  async listTools(): Promise<Tool[] | null> {
    const tools = await this.client.listTools()
    return tools.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? '',
      inputSchema: tool.inputSchema
    }))
  }

  async connectToServer(server: Server): Promise<{ code: number }> {
    const response = {
      code: 200
    }
    const transport = this.resolveTransport(server)
    try {
      await this.client.connect(transport)
      return response
    } catch (e) {
      // TODO: Catch e with correct exception and parse code if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.code = (e as any).code
      return response
    }
  }

  private resolveTransport(server: Server): Transport {
    if (server.transportConfig.type == 'STDIO')
      return new StdioClientTransport(server.transportConfig.options)
    const url = new URL(server.url)
    return new StreamableHTTPClientTransport(url, server.transportConfig.options)
  }
}
