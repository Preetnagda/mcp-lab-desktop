import Filters from '@renderer/components/Filters'
import ServerList from '@renderer/components/ServerList'
import { useEffect, useState } from 'react'
import { Server } from 'src/shared/models'

export default function Dashboard(): React.JSX.Element {
  const [servers, setServers] = useState<Server[]>([])
  useEffect(() => {
    window.api.getServers().then((servers) => {
      setServers(servers)
    })
  }, [])

  return (
    <div>
      <div className="flex justify-between py-2">
        <h1>Your MCP Servers</h1>
        <button className="btn">Register MCP Servers</button>
      </div>
      <Filters />
      <ServerList serverList={servers} />
    </div>
  )
}
