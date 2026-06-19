import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Server from './pages/Server'
import { Server as ServerInterface } from 'src/shared/models'
import { NavigationProvider, Page } from './navigation'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>({ page: 'dashboard', args: undefined })

  return (
    <NavigationProvider value={setCurrentPage}>
      <div className="bg-gray-700 text-white min-h-screen p-2">
        <Header currentPage={currentPage} />
        <div className="p-4">
          {currentPage.page == 'dashboard' && <Dashboard />}
          {currentPage.page == 'server' && <Server server={currentPage.args as ServerInterface} />}
        </div>
      </div>
    </NavigationProvider>
  )
}

export default App
