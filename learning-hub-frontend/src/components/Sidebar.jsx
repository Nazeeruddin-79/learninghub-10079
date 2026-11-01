import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  Video
} from 'lucide-react'

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const studentLinks = [
  {
    to: '/student',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true
  },
  {
    to: '/student/courses',
    label: 'My courses',
    icon: BookOpen
  },
  {
    to: '/student/progress',
    label: 'My progress',
    icon: ChartNoAxesColumnIncreasing
  },
  {
    to: '/student/quiz',
    label: 'Practice quiz',
    icon: ClipboardList
  }
]

const instructorLinks = [
  {
    to: '/instructor',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true
  },
  {
    to: '/instructor/courses',
    label: 'My courses',
    icon: BookOpen
  },
  {
    to: '/instructor/create-course',
    label: 'Create course',
    icon: PlusCircle
  },
  {
    to: '/instructor/lessons',
    label: 'Lessons & videos',
    icon: Video
  },
  {
    to: '/instructor/quizzes',
    label: 'Quizzes',
    icon: ClipboardList
  },
  {
    to: '/instructor/students',
    label: 'Students',
    icon: Users
  }
]

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = role === 'instructor'
    ? instructorLinks
    : studentLinks

  const displayName = user?.name || 'Learning Hub'
  const initial = displayName.charAt(0).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">
          <GraduationCap size={22} />
        </span>

        <span>
          learn<span className="brand-accent">hub</span>
        </span>
      </NavLink>

      <div className="workspace-label">
        {role === 'instructor' ? 'TEACHING SPACE' : 'LEARNING SPACE'}
      </div>

      <nav className="side-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>

          <strong>
            {role === 'instructor'
              ? 'Keep inspiring'
              : 'Small steps add up'}
          </strong>

          <p>
            {role === 'instructor'
              ? 'Your next lesson could change a life.'
              : 'A little learning every day goes a long way.'}
          </p>
        </div>

        <NavLink to="/" className="nav-item">
          <Settings size={18} />
          <span>Help & settings</span>
        </NavLink>

        <button
          type="button"
          className="nav-item logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <div className="profile-mini">
          <div className="avatar">{initial}</div>

          <div>
            <strong>{displayName}</strong>
            <span>{role || user?.role || 'student'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}