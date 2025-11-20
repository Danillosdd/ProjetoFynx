import { 
  BarChart3, Trophy, Target, Settings, Zap, Menu, X
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import goatLogo from "@/assets/FYNX CABRA SF.png"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Settings", url: "/settings", icon: Settings },
]

interface AppSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col h-full`}>
      {/* Header */}
      <div className={`relative ${isCollapsed ? 'p-4' : 'p-6'} border-b border-border flex items-center`}>
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
              className="ml-auto text-muted-foreground hover:text-foreground"
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
                `flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-start gap-3 px-3 py-2'} rounded-lg transition-colors ${
                  isActive
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

      {/* Pro Section */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} mt-auto`}>
        <div className={`bg-gradient-to-r from-purple-500 to-lime-500 ${isCollapsed ? 'p-2' : 'p-4'} rounded-lg`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'mb-2'}`}>
            <Zap className={`h-5 w-5 text-white ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && (
              <span className="text-sm font-medium text-white">Get Pro Now</span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <p className="text-xs text-white/90 mb-3">
                Unlock premium features
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white text-purple-600 hover:bg-white/90"
              >
                Upgrade Now
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}