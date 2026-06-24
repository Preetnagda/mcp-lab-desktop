import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'
import { ApiResponse, Server, Tool } from '../shared/models'
export interface Api {
  listTools: (serverId: number) => Promise<ApiResponse<Tool[]>>
  getServers: () => Promise<ApiResponse<Server[]>>
}

const api: Api = {
  getServers: () => ipcRenderer.invoke('servers:list'),
  listTools: (serverId: number) => ipcRenderer.invoke('tools:list', serverId)
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
