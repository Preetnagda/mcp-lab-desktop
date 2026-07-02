# MCP Lab

A desktop app for registering, connecting to, and inspecting [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers. Built with Electron, React, and TypeScript.

## Use case

An MCP server is usually a black box: you point an AI application at a URL, and from then on the AI can call whatever tools live behind it. There is no convenient way to look inside one directly — especially remote servers that sit behind OAuth. MCP Lab opens that box:

- **Register** remote MCP servers by URL and keep them in a persistent local registry.
- **Connect** over Streamable HTTP, including servers that require OAuth 2.0 sign-in — the app handles dynamic client registration, the PKCE authorization flow, and token storage for you.
- **Inspect** what each server offers: connection status, tool count, and each tool's name and description.

It serves two kinds of users:

- **Developers** building or evaluating MCP servers, who want to verify what a server exposes before wiring it into an AI application.
- **Anyone curious (or cautious) about what sits behind an MCP server** — for example, what an AI assistant would actually be able to do in your Notion workspace once you connect it. Browsing the tool list shows you the exact capabilities a server grants, in plain language, before you hand them to an AI.

## Try it with real servers

Register these from the dashboard (**+ Register server**) to see both connection modes:

| Server | URL | Auth |
| --- | --- | --- |
| Cloudflare Docs | `https://docs.mcp.cloudflare.com/mcp` | None — connects directly |
| Notion | `https://mcp.notion.com/mcp` | OAuth — opens a sign-in window |

**Cloudflare Docs (no auth):** register the URL, open the server's page, and click **Connect**. The tool list (e.g. documentation search) loads immediately.

**Notion (OAuth):** register the URL and click **Connect**. The server responds with an authorization challenge, and MCP Lab opens a Notion sign-in window. After you approve access, the window closes on its own, the app registers itself as an OAuth client, exchanges the authorization code for tokens (stored encrypted on your machine), reconnects, and the server's tools appear. Subsequent connections reuse the stored tokens — no sign-in needed.

## Architecture

MCP Lab follows the standard Electron three-process split. The renderer never touches Node, the network, or the MCP SDK directly; everything flows through a small typed IPC surface.

```
┌─────────────────────────── renderer (React) ───────────────────────────┐
│  Dashboard · Server page · Register form                               │
│  calls window.api.* and subscribes to push updates                     │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ contextBridge (typed Api)
┌────────────────────────────────┴─── preload ───────────────────────────┐
│  src/preload/index.ts — the only bridge between the two worlds         │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ ipcRenderer.invoke / ipcRenderer.on
┌────────────────────────────────┴─ main process ────────────────────────┐
│  index.ts        IPC handlers, window creation, OAuth callback handler │
│  api.ts          request/response API layer (always returns ApiResponse)│
│  events.ts       servers:updated push channel (main → renderer)        │
│  mcp/client.ts   MCPClient wrapper around @modelcontextprotocol/client │
│  mcp/OAuthProvider.ts  OAuthClientProvider backed by encrypted storage │
│  mcp/auth-flows.ts     pending OAuth flows keyed by single-use state   │
│  storage/        persistence (see below)                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### IPC surface

The renderer sees exactly one API, defined and typed in `src/preload/index.ts`:

| Call | Direction | Purpose |
| --- | --- | --- |
| `getServers()` | invoke | Registry merged with live connection state |
| `getServer(id)` | invoke | Fresh state for one server |
| `listTools(id)` | invoke | Connect (if needed) and list the server's tools |
| `registerServer(...)` | invoke | Validate and persist a new server |
| `onServersUpdated(cb)` | push | Fired by main when connection state changes (e.g. OAuth completes) |

Every invoke call returns `ApiResponse<T> = { ok: true; data } | { ok: false; message }` (`src/shared/models.ts`), so the renderer is forced by the compiler to handle failure before touching data, and main-process errors surface as messages instead of rejected promises.

### Storage

Three stores with distinct lifetimes, all under the app's user-data directory (`app-storage/`, e.g. `~/Library/Application Support/mcp-lab/app-storage` on macOS):

| Store | File | Contents |
| --- | --- | --- |
| Server registry | `server-store.json` | Registered servers (id, name, URL, transport) — plaintext config |
| Credentials | `client-store.json`, `token-store.json` | OAuth client registrations and tokens, encrypted with Electron `safeStorage` (OS keychain–backed) |
| Sessions | in-memory only | Live `MCPClient` instances and their cached tool lists |

### OAuth flow

For servers that answer the first connection attempt with an authorization challenge:

1. `MCPClient.connectToServer` catches the SDK's `UnauthorizedError`; the SDK has already performed dynamic client registration and built the authorization URL using `CustomOAuthProvider` (PKCE verifier and a **fresh single-use `state` nonce** recorded in `auth-flows.ts`).
2. The provider opens the authorization URL in a dedicated `BrowserWindow` running in an isolated session partition (`persist:callback-session`), keeping identity-provider cookies out of the app session.
3. The identity provider redirects to `mcp-lab://auth?code=...&state=...`. A protocol handler registered on that partition consumes the state nonce (unknown or replayed states are rejected), exchanges the code via the SDK, and stores the encrypted tokens.
4. The auth window is closed automatically, the client reconnects, and a `servers:updated` push tells the renderer to refresh — the dashboard and server page update live.

## Development

```bash
npm install        # install dependencies
npm run dev        # run with hot reload
npm run typecheck  # tsc across main + renderer configs
npm run lint       # eslint
```

### Build distributables

```bash
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Output lands in `dist/`. Note that macOS builds are currently unsigned/un-notarized, so recipients need to clear the quarantine flag (`xattr -cr /Applications/mcp-lab.app`) or use *System Settings → Privacy & Security → Open Anyway*.

## Current limitations

- Only Streamable HTTP transport is exposed in the UI (a STDIO code path exists but is not wired up).
- OAuth-protected servers must support [dynamic client registration](https://datatracker.ietf.org/doc/html/rfc7591)
- Tools can be browsed but not yet invoked — a tool playground is planned.
- Servers cannot be edited or deleted from the UI yet.
- OAuth sign-in happens in an embedded window; migrating to the system browser with an OS-registered deep link is planned for packaged builds.
