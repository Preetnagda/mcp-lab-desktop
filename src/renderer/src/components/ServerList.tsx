import { Server } from 'src/shared/models'
import { useNavigate } from '@renderer/navigation'

interface ServerListProps {
  serverList: Server[]
}

export default function ServerList({ serverList }: ServerListProps): React.JSX.Element {
  const navigate = useNavigate()
  return (
    <div className="py-2">
      <table className="w-full border">
        <thead className="p-2">
          <tr>
            <th className="text-left p-2">Server</th>
            <th className="text-left">Transport</th>
            <th className="text-left">Tools</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {serverList.map((server) => {
            return (
              <tr
                key={server.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate({
                    page: 'server',
                    args: server,
                    title: server.name,
                    backPage: 'dashboard'
                  })
                }
              >
                <td className="py-2">
                  <div>
                    <h3>{server.name}</h3>
                    <p>{server.url}</p>
                  </div>
                </td>
                <td>{server.transportConfig.type}</td>
                <td>{server.toolCount ?? 'N/A'}</td>
                <td>{server.connected ? 'Connected' : 'Non Connected'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
