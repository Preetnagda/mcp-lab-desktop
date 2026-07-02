import {
  Client,
  OAuthClientMetadata,
  OAuthClientProvider,
  StdioClientTransport,
  StreamableHTTPClientTransport,
  Transport,
  UnauthorizedError
} from '@modelcontextprotocol/client'
import { Server, Tool } from '../../shared/models'
import CustomOAuthProvider from './OAuthProvider'
import { BrowserWindow } from 'electron'
import { CALLBACK_SESSION_PARTITION } from '../constants'
import { attachAuthWindow } from './auth-flows'

const CALLBACK_URL = 'mcp-lab://auth'

interface ConnectionResponse {
  connected: boolean
  authPending: boolean
  message?: string
}

export class MCPClient {
  private client: Client
  private authProvider?: OAuthClientProvider
  private _connected: boolean
  private _tools?: Tool[]

  constructor() {
    this.client = new Client({
      name: 'mcp-lab',
      version: '1.0'
    })
    this._connected = false
  }

  get connected(): boolean {
    return this._connected
  }

  getClient(): Client {
    return this.client
  }

  get toolCount(): number | undefined {
    return this._tools?.length
  }

  async listTools(): Promise<Tool[] | undefined> {
    if (!this._tools) {
      await this.refreshTools()
    }
    return this._tools
  }

  async refreshTools(): Promise<Tool[] | undefined> {
    const tools = await this.client.listTools()
    this._tools = tools.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? '',
      inputSchema: tool.inputSchema
    }))
    return this._tools
  }

  async connectToServer(server: Server, authCode?: string): Promise<ConnectionResponse> {
    if (!this.authProvider) {
      this.authProvider = this.resolveAuthProvider(server)
    }
    const transport = this.resolveTransport(server, this.authProvider)
    const response: ConnectionResponse = {
      connected: false,
      authPending: false
    }
    try {
      if (authCode && server.transportConfig.type == 'HTTP') {
        await (transport as StreamableHTTPClientTransport).finishAuth(authCode)
      }
      await this.client.connect(transport)
      this._connected = true
      response.connected = true
      return response
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        this._connected = false
        response.authPending = true
      } else {
        response.message = error instanceof Error ? error.message : String(error)
      }
    }
    return response
  }

  private resolveAuthProvider(server: Server): OAuthClientProvider {
    const clientMetadata: OAuthClientMetadata = {
      client_name: 'mcp-lab',
      redirect_uris: [CALLBACK_URL],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code']
    }
    const authProvider = new CustomOAuthProvider(
      CALLBACK_URL,
      clientMetadata,
      (authorizationUrl: URL) => {
        // Isolated session: keeps IdP cookies out of the app session and is the
        // session the mcp-lab:// callback protocol handler is registered on.
        const oAuthWindow = new BrowserWindow({
          webPreferences: {
            partition: CALLBACK_SESSION_PARTITION,
            sandbox: true
          }
        })
        const state = authorizationUrl.searchParams.get('state')
        if (state) attachAuthWindow(state, oAuthWindow)
        oAuthWindow.loadURL(authorizationUrl.href)
      },
      server.url,
      server.id
    )

    return authProvider
  }

  private resolveTransport(server: Server, authProvider: OAuthClientProvider): Transport {
    if (server.transportConfig.type == 'STDIO')
      return new StdioClientTransport(server.transportConfig.options)
    const url = new URL(server.url)
    return new StreamableHTTPClientTransport(url, {
      ...server.transportConfig.options,
      authProvider
    })
  }
}
