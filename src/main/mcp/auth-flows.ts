import { BrowserWindow } from 'electron'
import { randomUUID } from 'node:crypto'

interface AuthFlow {
  serverId: string
  window?: BrowserWindow
}

// Pending OAuth flows keyed by the `state` nonce sent to the authorization
// server. A callback with an unknown state is rejected, and each state is
// single-use (consumed on callback).
const pendingFlows = new Map<string, AuthFlow>()

export function createAuthFlow(serverId: string): string {
  const state = randomUUID()
  pendingFlows.set(state, { serverId })
  return state
}

export function attachAuthWindow(state: string, window: BrowserWindow): void {
  const flow = pendingFlows.get(state)
  if (!flow) return
  flow.window = window
  window.on('closed', () => {
    pendingFlows.delete(state)
  })
}

export function consumeAuthFlow(state: string): AuthFlow | undefined {
  const flow = pendingFlows.get(state)
  pendingFlows.delete(state)
  return flow
}
