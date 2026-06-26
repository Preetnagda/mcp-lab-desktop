import { useCallback, useEffect, useState } from 'react'
import { Tool, Server as ServerInterface } from 'src/shared/models'

interface ServerProps {
  server: ServerInterface
}
export default function Server({ server }: ServerProps): React.JSX.Element {
  const [tools, setTools] = useState<Tool[]>([])
  const [error, setError] = useState<string>('')
  const handleConnect = useCallback((): void => {
    window.api.listTools(server.id).then((response) => {
      if (response.error) {
        setError(response.message ?? 'Error loading tools')
      } else {
        setTools(response.data)
      }
    })
  }, [server.id])
  useEffect(() => {
    if (server.connected) {
      handleConnect()
    }
  }, [server.connected, handleConnect])
  return (
    <div>
      <div>
        <button onClick={handleConnect}>Connect</button>
      </div>
      {error && <div>Error: {error}</div>}
      {tools.map((tool: Tool) => {
        return (
          <div key={tool.name}>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </div>
        )
      })}
    </div>
  )
}
