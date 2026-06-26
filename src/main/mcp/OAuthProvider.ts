import {
  OAuthClientInformationMixed,
  OAuthClientMetadata,
  OAuthClientProvider,
  OAuthTokens
} from '@modelcontextprotocol/client'
import {
  getClientCredentials,
  getToken,
  storeClientCredentials,
  storeToken
} from '../storage/credential-store'

export default class CustomOAuthProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationMixed
  private _tokens?: OAuthTokens
  private _codeVerifier?: string

  constructor(
    private _redirectUrl: string,
    private _clientMetadata: OAuthClientMetadata,
    private _redirectAction: CallableFunction,
    private serverUrl: string,
    private _state: string
  ) {}

  get redirectUrl(): string {
    return this._redirectUrl
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata
  }

  clientInformation(): OAuthClientInformationMixed | undefined {
    return this._clientInformation ?? getClientCredentials(this.serverUrl)
  }

  saveClientInformation(clientInformation: OAuthClientInformationMixed): Promise<void> {
    this._clientInformation = clientInformation
    return storeClientCredentials(this.serverUrl, clientInformation)
  }

  codeVerifier(): string {
    return this._codeVerifier ?? ''
  }

  saveCodeVerifier(codeVerifier: string): void {
    this._codeVerifier = codeVerifier
  }

  state(): string | Promise<string> {
    return this._state
  }

  redirectToAuthorization(authorizationUrl: URL): void | Promise<void> {
    this._redirectAction(authorizationUrl)
  }

  tokens(): OAuthTokens | undefined | Promise<OAuthTokens | undefined> {
    return this._tokens ?? getToken(this.serverUrl)
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this._tokens = tokens
    await storeToken(this.serverUrl, tokens)
  }
}
