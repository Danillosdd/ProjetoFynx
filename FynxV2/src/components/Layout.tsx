import { useState } from "react"
import { AppSidebar } from "./AppSidebar"
import { useLocation } from "react-router-dom"
import { TourButton } from './TourButton'

function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-background px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-semibold">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/ranking' && 'Ranking'}
              {location.pathname === '/metas' && 'Metas'}
            </h1>
            <TourButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout