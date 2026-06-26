import { OAuthClientInformationMixed, OAuthTokens } from '@modelcontextprotocol/client'
import { safeStorage } from 'electron'
import { getFileData, writeFileData } from './file-storage-layer'

const CLIENT_CRENDENTIALS_FILENAME = 'client-store.json'
const TOKENS_FILENAME = 'token-store.json'

export async function storeToken(serverUrl: string, token: OAuthTokens): Promise<void> {
  await storeCredential(serverUrl, token, TOKENS_FILENAME)
}

export function getToken(serverUrl: string): OAuthTokens | undefined {
  return getCredential(serverUrl, TOKENS_FILENAME) as OAuthTokens | undefined
}

export async function storeClientCredentials(
  serverUrl: string,
  credential: OAuthClientInformationMixed
): Promise<void> {
  await storeCredential(serverUrl, credential, CLIENT_CRENDENTIALS_FILENAME)
}

export function getClientCredentials(serverUrl: string): OAuthClientInformationMixed | undefined {
  return getCredential(serverUrl, CLIENT_CRENDENTIALS_FILENAME) as
    | OAuthClientInformationMixed
    | undefined
}

async function storeCredential(
  serverUrl: string,
  credential: unknown,
  fileName: string
): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Unable to store credenitals. Encryption method unavailable')
  }
  const encryptedCredentials = safeStorage.encryptString(JSON.stringify(credential))
  const allClientCredentials = JSON.parse(getFileData(fileName) ?? '{}')
  allClientCredentials[serverUrl] = encryptedCredentials
  await writeFileData(JSON.stringify(allClientCredentials), fileName)
}

function getCredential(serverUrl: string, fileName: string): unknown | undefined {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Unable to get credenitals. Encryption method unavailable')
  }
  const allClientCredentials = JSON.parse(getFileData(fileName) ?? '{}')
  const clientCredentials = allClientCredentials[serverUrl]
  return clientCredentials
    ? JSON.parse(safeStorage.decryptString(Buffer.from(clientCredentials)))
    : undefined
}
