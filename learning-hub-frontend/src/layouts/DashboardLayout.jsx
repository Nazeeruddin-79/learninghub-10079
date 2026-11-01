import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

export default function DashboardLayout({ role, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  const displayName = user?.name || 'Learning Hub'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="dashboard-shell">
      <div className={menuOpen ? 'sidebar-wrap open' : 'sidebar-wrap'}>
        <Sidebar role={role} />
      </div>

      {menuOpen && (
        <button
          type="button"
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="dashboard-main">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            Workspace
            <span>/</span>
            <strong>
              {role === 'instructor' ? 'Instructor' : 'Student'}
            </strong>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Search"
              title="Search"
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>

            <div
              className="topbar-avatar"
              title={displayName}
              aria-label={`Signed in as ${displayName}`}
            >
              {initial}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}