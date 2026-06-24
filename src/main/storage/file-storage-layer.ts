import { app } from 'electron'
import { readFileSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export function getFileData(fileName: string): string | undefined {
  const file = path.join(app.getPath('userData'), 'app-storage', fileName)
  try {
    const clientStorage = readFileSync(file, {})
    return clientStorage.toString()
  } catch {
    return undefined
  }
}

export async function writeFileData(data: string, fileName: string): Promise<void> {
  const file = path.join(app.getPath('userData'), 'app-storage', fileName)
  await mkdir(path.dirname(file), { recursive: true })
  return writeFile(file, data)
}
