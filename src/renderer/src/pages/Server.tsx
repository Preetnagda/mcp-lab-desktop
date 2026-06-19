import { ReactNode, useEffect, useState } from 'react'
import { Tool, Server as ServerInterface } from 'src/shared/models'

interface ServerProps {
  server: ServerInterface
}
export default function Server({ server }: ServerProps): React.JSX.Element {
  const [tools, setTools] = useState<Tool[]>([])
  const [error, setError] = useState<string>('')
  const handleConnect = (): void => {
    window.api.listTools(server.id).then((tools) => {
      if (!tools) {
        setError('Not connected')
      } else {
        setTools(tools)
      }
    })
  }
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
