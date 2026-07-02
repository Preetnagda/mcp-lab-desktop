import {
  StdioServerParameters,
  StreamableHTTPClientTransportOptions
} from '@modelcontextprotocol/client'

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; message: string }

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

export interface Tool {
  name: string
  description: string
  inputSchema: unknown
}
