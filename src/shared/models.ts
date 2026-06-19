import { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransportOptions } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

export type TransportConfig =
  | { type: 'HTTP'; options: StreamableHTTPClientTransportOptions }
  | { type: 'STDIO'; options: StdioServerParameters }

export interface Server {
  id: number
  name: string
  url: string
  transportConfig: TransportConfig
}

export interface ConnectedServer extends Server {
  tools: unknown
  description: unknown
}

export interface Tool {
  name: string
  description: string
  inputSchema: unknown
}
