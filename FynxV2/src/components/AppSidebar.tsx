import {
  BarChart3, Trophy, Target, Settings, Zap, Menu, X, LogOut
} from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import goatLogo from "@/assets/FYNX CABRA SF.png"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Metas", url: "/metas", icon: Target },
]

interface AppSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  const handleLogout = () => {
    // Futuramente: limpar localStorage, sessão, etc.
    navigate('/login')
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col h-full`}>
      {/* Header */}
      <div className={`relative ${isCollapsed ? 'px-4 py-4' : 'px-6 py-4'} border-b border-border flex items-center`}>
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Expandir navbar"
            title="Expandir navbar"
            className="h-11 w-11 p-0"
          >
            <img src={goatLogo} alt="Fynx" className="h-10 w-10 object-contain rounded-full" />
          </Button>
        ) : (
          <>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <img src={goatLogo} alt="Fynx" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-foreground">Fynx</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              aria-label="Colapsar navbar"
              className="ml-auto opacity-70 hover:opacity-100 hover:bg-accent hover:text-accent-foreground transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 flex-1`}>
        <nav className={`space-y-1`}>
          {mainItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              data-tour={item.url === '/ranking' ? 'ranking-link' : undefined}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-start gap-3 px-3 py-2'} rounded-lg transition-colors ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-border`}>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full ${isCollapsed ? 'justify-center p-3' : 'justify-start gap-3 px-3 py-2'} text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors`}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>

    </div>
  )
}