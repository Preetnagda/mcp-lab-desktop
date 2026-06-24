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
