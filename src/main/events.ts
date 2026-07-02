import { BrowserWindow } from 'electron'

export function notifyServersUpdated(): void {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('servers:updated')
  }
}
