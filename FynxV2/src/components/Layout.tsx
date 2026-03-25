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
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <div className="absolute top-4 right-6 z-50">
          <TourButton />
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout