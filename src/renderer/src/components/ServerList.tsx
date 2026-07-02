import { Server } from 'src/shared/models'
import { useNavigate } from '@renderer/navigation'

// Shared grid template so the header row and data rows stay aligned.
const COLS = 'grid-cols-[2.4fr_0.9fr_0.7fr_1fr_1.1fr_20px]'

function transportLabel(type: string): string {
  return type.toUpperCase() === 'STDIO' ? 'stdio' : type.toUpperCase()
}

interface StatusMeta {
  label: string
  dotClass: string
  textClass: string
}

function statusMeta(server: Server): StatusMeta {
  // TODO(backend): the Server model only exposes `connected`. The design also has
  // an amber "Auth required" state and a connection-age label ("Connected 2h").
  // Surface an auth-status / connected-since field from the backend to render those.
  if (server.connected) {
    return { label: 'Connected', dotClass: 'bg-ok', textClass: 'text-ok-text' }
  }
  return {
    label: 'Not connected',
    dotClass: 'border-[1.5px] border-off bg-transparent',
    textClass: 'text-off-text'
  }
}

interface ServerListProps {
  serverList: Server[]
}

export default function ServerList({ serverList }: ServerListProps): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface">
      <div
        className={`grid ${COLS} items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.75 text-[11px] uppercase tracking-wider text-faint`}
      >
        <span>Server</span>
        <span>Transport</span>
        <span>Tools</span>
        <span>Status</span>
        <span />
      </div>

      {serverList.length === 0 ? (
        <div className="px-4 py-10 text-center text-[13px] text-muted-2">No servers found.</div>
      ) : (
        serverList.map((server) => {
          const status = statusMeta(server)
          return (
            <div
              key={server.id}
              onClick={() =>
                navigate({
                  page: 'server',
                  args: server.id,
                  title: server.name,
                  backPage: 'dashboard'
                })
              }
              className={`grid ${COLS} cursor-pointer items-center gap-3 border-b border-line-row px-4 py-3.25 last:border-b-0 hover:bg-surface-2`}
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink">{server.name}</div>
                <div className="truncate font-mono text-[11px] text-faint">{server.url}</div>
              </div>
              <span className="justify-self-start rounded-full border border-line-strong bg-badge px-2 py-0.5 font-mono text-[11px] text-ink-3">
                {transportLabel(server.transportConfig.type)}
              </span>
              <span className="text-[13px] text-muted">{server.toolCount ?? '—'}</span>
              <span className={`flex items-center gap-1.5 text-xs ${status.textClass}`}>
                <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
              <span className="justify-self-end text-[13px] text-off">›</span>
            </div>
          )
        })
      )}
    </div>
  )
}
