import { OAuthClientInformationMixed } from '@modelcontextprotocol/client'
import { safeStorage } from 'electron'
import { getFileData, writeFileData } from './file-storage-layer'

const FILENAME = 'client-store.json'

export async function storeClientCredentials(
  serverUrl: string,
  credentials: OAuthClientInformationMixed
): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Unable to store credenitals. Encryption method unavailable')
  }
  const encryptedCredentials = safeStorage.encryptString(JSON.stringify(credentials))
  const allClientCredentials = JSON.parse(getFileData(FILENAME) ?? '{}')
  allClientCredentials[serverUrl] = encryptedCredentials
  await writeFileData(JSON.stringify(allClientCredentials), FILENAME)
}

export function getClientCredentials(serverUrl: string): OAuthClientInformationMixed | undefined {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Unable to get credenitals. Encryption method unavailable')
  }
  const allClientCredentials = JSON.parse(getFileData(FILENAME) ?? '{}')
  const clientCredentials = allClientCredentials[serverUrl]
  return clientCredentials
    ? (JSON.parse(
        safeStorage.decryptString(Buffer.from(clientCredentials))
      ) as OAuthClientInformationMixed)
    : undefined
}
