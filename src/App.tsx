import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getUser, homePathFor, isAuthenticated } from './auth/session.ts'
import AppLayout from './components/AppLayout.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import LoginPage from './pages/LoginPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import StudentDetailView from './pages/StudentDetailView.tsx'
import StudentsListView from './pages/StudentsListView.tsx'

function HomeRedirect() {
  const user = getUser()

  if (!isAuthenticated() || user === null) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={homePathFor(user.role)} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/students" element={<StudentsListView />} />
              <Route path="/students/:id" element={<StudentDetailView />} />
            </Route>

            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

