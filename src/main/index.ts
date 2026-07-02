import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getServerDetails, getServers, getTools, registerServer } from './api'
import { getClient, storeClient } from './storage/session-store'
import { getServer } from './storage/mcp-servers-store'
import { consumeAuthFlow } from './mcp/auth-flows'
import { notifyServersUpdated } from './events'
import { CALLBACK_SESSION_PARTITION } from './constants'
import { RegisterServer } from '../shared/models'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Handles the OAuth redirect (mcp-lab://auth?code=...&state=...) inside the
// isolated session the auth window runs in. The state nonce is single-use and
// maps back to the server whose flow is pending.
function registerAuthCallbackHandler(): void {
  const callbackSession = session.fromPartition(CALLBACK_SESSION_PARTITION)
  callbackSession.protocol.handle('mcp-lab', async (request: Request): Promise<Response> => {
    const requestUrl = new URL(request.url)
    const state = requestUrl.searchParams.get('state') ?? ''
    const authCode = requestUrl.searchParams.get('code') ?? ''
    const flow = consumeAuthFlow(state)

    const closeAuthWindow = (): void => {
      if (flow?.window && !flow.window.isDestroyed()) flow.window.close()
      BrowserWindow.getAllWindows()
        .find((window) => window !== flow?.window && !window.isDestroyed())
        ?.focus()
    }

    if (!flow || !authCode) {
      closeAuthWindow()
      return new Response('Invalid authorization callback', { status: 400 })
    }

    const server = getServer(flow.serverId)
    const client = getClient(flow.serverId)
    if (!server || !client) {
      closeAuthWindow()
      return new Response('Unknown server for this authorization', { status: 400 })
    }

    const connection = await client.connectToServer(server, authCode)
    if (connection.connected) {
      storeClient(flow.serverId, client)
      // Populate the tool cache so toolCount is available to the dashboard.
      await client.listTools().catch(() => undefined)
    }
    closeAuthWindow()
    notifyServersUpdated()

    if (!connection.connected) {
      return new Response(connection.message ?? 'Authorization failed', { status: 401 })
    }
    return new Response('Authentication complete', { status: 200 })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.mcp-lab.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('tools:list', (_, serverId: string) => getTools(serverId))
  ipcMain.handle('servers:list', () => getServers())
  ipcMain.handle('servers:get', (_, serverId: string) => getServerDetails(serverId))
  ipcMain.handle('servers:register', (_, server: RegisterServer) => registerServer(server))

  registerAuthCallbackHandler()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
