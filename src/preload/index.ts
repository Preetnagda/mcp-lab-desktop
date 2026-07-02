import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'
import { ApiResponse, RegisterServer, Server, Tool } from '../shared/models'
export interface Api {
  listTools: (serverId: string) => Promise<ApiResponse<Tool[]>>
  getServers: () => Promise<ApiResponse<Server[]>>
  getServer: (serverId: string) => Promise<ApiResponse<Server>>
  registerServer: (server: RegisterServer) => Promise<ApiResponse<string>>
  onServersUpdated: (callback: () => void) => () => void
}

const api: Api = {
  getServers: () => ipcRenderer.invoke('servers:list'),
  getServer: (serverId) => ipcRenderer.invoke('servers:get', serverId),
  listTools: (serverId) => ipcRenderer.invoke('tools:list', serverId),
  registerServer: (server) => ipcRenderer.invoke('servers:register', server),
  onServersUpdated: (callback) => {
    const listener = (): void => callback()
    ipcRenderer.on('servers:updated', listener)
    return () => {
      ipcRenderer.removeListener('servers:updated', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
