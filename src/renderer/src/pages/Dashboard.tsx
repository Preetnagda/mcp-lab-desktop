import Filters from '@renderer/components/Filters'
import ServerList from '@renderer/components/ServerList'
import { useNavigate } from '@renderer/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Server } from 'src/shared/models'

export default function Dashboard(): React.JSX.Element {
  const [servers, setServers] = useState<Server[]>([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [transport, setTransport] = useState('all')
  const navigate = useNavigate()

  const loadServers = useCallback((): void => {
    window.api
      .getServers()
      .then((response) => {
        if (response.ok) {
          setError('')
          setServers(response.data)
        } else {
          setError(response.message)
        }
      })
      .catch(() => setError('Failed to load servers'))
  }, [])

  // Fetch on mount and re-fetch when main pushes a state change
  // (e.g. OAuth flow completed); the subscription return is the cleanup.
  useEffect(() => {
    loadServers()
    return window.api.onServersUpdated(loadServers)
  }, [loadServers])

  const transports = useMemo(
    () => Array.from(new Set(servers.map((server) => server.transportConfig.type))),
    [servers]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return servers.filter((server) => {
      const matchesQuery =
        !query ||
        server.name.toLowerCase().includes(query) ||
        server.url.toLowerCase().includes(query)
      const matchesTransport = transport === 'all' || server.transportConfig.type === transport
      return matchesQuery && matchesTransport
    })
  }, [servers, search, transport])

  const handleRegister = (): void => {
    navigate({ page: 'register-server', args: {}, backPage: 'dashboard' })
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-ink">Your MCP servers</h1>
          <p className="mt-0.5 text-[13px] text-muted-2">
            {servers.length} registered · click a row to open its page
          </p>
        </div>
        <button
          onClick={handleRegister}
          className="rounded-lg bg-accent-strong px-4.5 py-2.5 font-brand text-base text-black hover:brightness-110 hover:cursor-pointer"
        >
          + Register server
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-line-strong bg-surface px-4 py-3 text-[13px] text-warn-text">
          {error}
        </div>
      )}

      <div className="pt-4">
        <Filters
          search={search}
          onSearchChange={setSearch}
          transport={transport}
          onTransportChange={setTransport}
          transports={transports}
        />
      </div>

      <div className="pt-4">
        <ServerList serverList={filtered} />
      </div>
    </div>
  )
}
