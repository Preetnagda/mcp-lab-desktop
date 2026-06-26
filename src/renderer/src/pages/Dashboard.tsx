import Filters from '@renderer/components/Filters'
import ServerList from '@renderer/components/ServerList'
import { useNavigate } from '@renderer/navigation'
import { useEffect, useState } from 'react'
import { Server } from 'src/shared/models'

export default function Dashboard(): React.JSX.Element {
  const [servers, setServers] = useState<Server[]>([])
  const navigate = useNavigate()
  useEffect(() => {
    window.api.getServers().then((response) => {
      setServers(response.data)
    })
  }, [])

  const handleRegisterButton = (): void => {
    navigate({
      page: 'register-server',
      args: {},
      backPage: 'dashboard'
    })
  }

  return (
    <div>
      <div className="flex justify-between py-2">
        <h1>Your MCP Servers</h1>
        <button onClick={handleRegisterButton} className="btn">
          Register MCP Servers
        </button>
      </div>
      <Filters />
      <ServerList serverList={servers} />
    </div>
  )
}
