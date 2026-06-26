import { useState } from 'react'
import { useNavigate } from '@renderer/navigation'

const TRANSPORT_TYPES = ['HTTP'] as const
type TransportType = (typeof TRANSPORT_TYPES)[number]

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
    const response = await window.api.registerServer({
      name,
      url,
      type: transportType
    })
    setSubmitting(false)
    if (response.error) {
      setError(response.message ?? 'Failed to register server')
      return
    }
    navigate({ page: 'dashboard', args: undefined })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="transport">Transport Type</label>
        <select
          id="transport"
          value={transportType}
          onChange={(event) => setTransportType(event.target.value as TransportType)}
        >
          {TRANSPORT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {error && <div>Error: {error}</div>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering…' : 'Register Server'}
      </button>
    </form>
  )
}
