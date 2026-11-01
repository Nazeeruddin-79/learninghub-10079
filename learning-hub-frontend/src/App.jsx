
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import { Home, Login, Register } from './pages/PublicPages'
import {
  CourseDetails,
  LessonPlayer,
  QuizPage,
  StudentCourses,
  StudentDashboard,
  StudentProgress
} from './pages/StudentPages'
import {
  CreateCourse,
  InstructorDashboard,
  InstructorStudents,
  ManageCourses,
  ManageLessons,
  ManageQuizzes
} from './pages/InstructorPages'

function RequireRole({ role, children }) {
  const { user, authLoading } = useAuth()

  // Wait for the backend to verify the saved session.
  if (authLoading) {
    return <p className="loading-message">Checking your session...</p>
  }

  // Redirect users who are not logged in.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect users to their correct dashboard.
  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === 'instructor' ? '/instructor' : '/student'}
        replace
      />
    )
  }

  return children
}

function StudentShell({ children }) {
  return (
    <RequireRole role="student">
      <DashboardLayout role="student">
        {children}
      </DashboardLayout>
    </RequireRole>
  )
}

function InstructorShell({ children }) {
  return (
    <RequireRole role="instructor">
      <DashboardLayout role="instructor">
        {children}
      </DashboardLayout>
    </RequireRole>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student pages */}
      <Route
        path="/student"
        element={<StudentShell><StudentDashboard /></StudentShell>}
      />
      <Route
        path="/student/courses"
        element={<StudentShell><StudentCourses /></StudentShell>}
      />
      <Route
        path="/student/course/:courseId"
        element={<StudentShell><CourseDetails /></StudentShell>}
      />
      <Route
        path="/student/lesson/:courseId"
        element={<StudentShell><LessonPlayer /></StudentShell>}
      />
      <Route
        path="/student/quiz"
        element={<StudentShell><QuizPage /></StudentShell>}
      />
      <Route
        path="/student/progress"
        element={<StudentShell><StudentProgress /></StudentShell>}
      />

      {/* Instructor pages */}
      <Route
        path="/instructor"
        element={<InstructorShell><InstructorDashboard /></InstructorShell>}
      />
      <Route
        path="/instructor/courses"
        element={<InstructorShell><ManageCourses /></InstructorShell>}
      />
      <Route
        path="/instructor/create-course"
        element={<InstructorShell><CreateCourse /></InstructorShell>}
      />
      <Route
        path="/instructor/lessons"
        element={<InstructorShell><ManageLessons /></InstructorShell>}
      />
      <Route
        path="/instructor/quizzes"
        element={<InstructorShell><ManageQuizzes /></InstructorShell>}
      />
      <Route
        path="/instructor/students"
        element={<InstructorShell><InstructorStudents /></InstructorShell>}
      />

      {/* Unknown pages */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
