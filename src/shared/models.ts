import {
  StdioServerParameters,
  StreamableHTTPClientTransportOptions
} from '@modelcontextprotocol/client'

export interface ApiResponse<T> {
  error: boolean
  data: T
  message?: string
}

export type TransportConfig =
  | { type: 'HTTP'; options: StreamableHTTPClientTransportOptions }
  | { type: 'STDIO'; options: StdioServerParameters }

export interface RawServer {
  name: string
  url: string
}

export interface RegisterServer extends RawServer {
  type: 'HTTP' | 'STDIO'
}

export interface Server extends RawServer {
  id: string
  transportConfig: TransportConfig
  toolCount?: number
  connected?: boolean
}

export interface ConnectedServer extends Server {
  tools: unknown
}

export interface Tool {
  name: string
  description: string
  inputSchema: unknown
}
