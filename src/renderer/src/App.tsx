import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Server from './pages/Server'
import { NavigationProvider, Page } from './navigation'
import RegisterServer from './pages/RegisterServer'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<Page>({ page: 'dashboard', args: undefined })

  return (
    <NavigationProvider value={setCurrentPage}>
      <div className="flex h-screen flex-col bg-app text-ink">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-auto px-7 py-6">
          {currentPage.page == 'dashboard' && <Dashboard />}
          {currentPage.page == 'server' && <Server serverId={currentPage.args as string} />}
          {currentPage.page == 'register-server' && <RegisterServer />}
        </main>
      </div>
    </NavigationProvider>
  )
}

export default App
