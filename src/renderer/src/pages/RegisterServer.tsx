import { useState } from 'react'
import { useNavigate } from '@renderer/navigation'

const TRANSPORT_TYPES = ['HTTP'] as const
type TransportType = (typeof TRANSPORT_TYPES)[number]

const FIELD_CLASS =
  'w-full rounded-[7px] border-[1.5px] border-line-strong bg-app px-2.75 py-2.25 text-[13px] text-ink outline-none placeholder:text-faint-2 focus:border-accent'

export default function RegisterServer(): React.JSX.Element {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [transportType, setTransportType] = useState<TransportType>('HTTP')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await window.api.registerServer({
        name,
        url,
        type: transportType
      })
      if (!response.ok) {
        setError(response.message)
        return
      }
      navigate({ page: 'dashboard', args: undefined })
    } catch {
      setError('Failed to register server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-ink">Register a server</h1>
        <p className="mt-0.5 text-[13px] text-muted-2">Add a new MCP server to your registry.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[10px] border border-line-strong bg-surface p-5"
      >
        <div className="mb-5">
          <label htmlFor="name" className="mb-1.5 flex items-baseline gap-2">
            <span className="text-[13px] text-ink-2">Name</span>
            <span className="text-[10px] uppercase tracking-wider text-warn-text">required</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="filesystem"
            className={FIELD_CLASS}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="url" className="mb-1.5 flex items-baseline gap-2">
            <span className="text-[13px] text-ink-2">URL</span>
            <span className="text-[10px] uppercase tracking-wider text-warn-text">required</span>
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            placeholder="https://example.com/mcp"
            className={`${FIELD_CLASS} font-mono`}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="transport" className="mb-1.5 block text-[13px] text-ink-2">
            Transport Type
          </label>
          <div className="relative">
            <select
              id="transport"
              value={transportType}
              onChange={(event) => setTransportType(event.target.value as TransportType)}
              className={`${FIELD_CLASS} cursor-pointer appearance-none pr-9`}
            >
              {TRANSPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint-2">
              ▾
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border-[1.5px] border-line-strong bg-app px-3 py-2.5 text-[13px] text-warn-text">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent-strong px-5 py-2.25 font-brand text-base text-white hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Registering…' : 'Register server'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'dashboard', args: undefined })}
            className="rounded-lg border border-line-strong bg-surface-3 px-4 py-2.25 text-[13px] text-muted hover:bg-badge"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
