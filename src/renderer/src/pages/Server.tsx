import { useCallback, useEffect, useState } from 'react'
import { Tool, Server as ServerInterface } from 'src/shared/models'

interface ServerProps {
  server: ServerInterface
}

export default function Server({ server }: ServerProps): React.JSX.Element {
  const [tools, setTools] = useState<Tool[]>([])
  const [error, setError] = useState<string>('')
  const [selected, setSelected] = useState<string | null>(null)

  const handleConnect = useCallback((): void => {
    window.api.listTools(server.id).then((response) => {
      if (response.error) {
        setError(response.message ?? 'Error loading tools')
      } else {
        setError('')
        setTools(response.data)
        setSelected((prev) => prev ?? response.data[0]?.name ?? null)
      }
    })
  }, [server.id])

  useEffect(() => {
    if (server.connected) handleConnect()
  }, [server.connected, handleConnect])

  const selectedTool = tools.find((tool) => tool.name === selected) ?? null

  return (
    <div>
      {/* title block */}
      <div className="mb-5.5 flex items-start gap-3.5">
        <span className="flex h-11.5 w-11.5 flex-none items-center justify-center rounded-[11px] border border-line-strong bg-badge">
          <span className="h-4.5 w-4.5 rounded bg-[#57534b]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-bold text-ink">{server.name}</span>
            <span className="rounded-full border border-line-strong bg-badge px-2 py-0.5 font-mono text-[11px] text-ink-3">
              {server.transportConfig.type}
            </span>
          </div>
          <div className="mt-1.5 font-mono text-xs text-faint">{server.url}</div>
        </div>
        <button
          onClick={handleConnect}
          className="flex flex-none items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-muted hover:bg-surface-2"
        >
          {server.connected ? 'Reload tools' : 'Connect'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-line-strong bg-surface px-4 py-3 text-[13px] text-warn-text">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[20%_1fr] items-start gap-3.5 py-4">
        {/* tools list */}
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface">
          <div className="px-4 pb-2.5 pt-3.5 text-[11px] uppercase tracking-wider text-faint">
            Tools · {tools.length}
          </div>
          <div className="flex flex-col">
            {tools.length === 0 ? (
              <div className="px-4 pb-4 text-[12.5px] text-muted-2">
                {server.connected ? 'No tools.' : 'Connect to load tools.'}
              </div>
            ) : (
              tools.map((tool) => {
                const active = tool.name === selected
                return (
                  <button
                    key={tool.name}
                    onClick={() => setSelected(tool.name)}
                    className={`flex items-center gap-2 border-l-[3px] py-2.5 pl-4 pr-3.5 text-left font-mono text-[12.5px] ${
                      active
                        ? 'border-accent bg-[#2a3340] text-[#cfe0f5]'
                        : 'border-transparent text-muted hover:bg-surface-2'
                    }`}
                  >
                    {tool.name}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* tool detail */}
        <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface">
          {selectedTool ? (
            <div className="border-b border-line-row p-4.5">
              <div className="font-mono text-base font-bold text-ink">{selectedTool.name}</div>
              {selectedTool.description && (
                <div className="mt-1.5 text-[12.5px] leading-relaxed text-muted-2">
                  {selectedTool.description}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4.5 text-[13px] text-muted-2">Select a tool to see details.</div>
          )}
          {/* TODO(backend): the design's tool playground (an input form rendered from the
              tool's inputSchema, a "Call tool" action, and the response/latency panel) needs a
              tool-invocation API (e.g. window.api.callTool) that is not implemented yet. */}
        </div>
      </div>
    </div>
  )
}
