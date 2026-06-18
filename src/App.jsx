import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Timeline from './pages/Timeline'
import Obyektlar from './pages/Obyektlar'
import ObyektDetail from './pages/ObyektDetail'
import Smeta from './pages/Smeta'
import Brigadalar from './pages/Brigadalar'
import Davomat from './pages/Davomat'
import Tolovlar from './pages/Tolovlar'
import Katalog from './pages/Katalog'
import Yana from './pages/Yana'

function Shell({ children }) {
  const location = useLocation()
  const hideNav = location.pathname === '/login'

  if (hideNav) {
    return <div className="min-h-screen bg-bg">{children}</div>
  }

  return (
    <div className="min-h-screen bg-bg md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-2xl md:max-w-5xl mx-auto pb-20 md:pb-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obyektlar"
          element={
            <ProtectedRoute>
              <Obyektlar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obyektlar/:id"
          element={
            <ProtectedRoute>
              <ObyektDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obyektlar/:id/smeta"
          element={
            <ProtectedRoute>
              <Smeta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/brigadalar"
          element={
            <ProtectedRoute>
              <Brigadalar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/davomat"
          element={
            <ProtectedRoute>
              <Davomat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tolovlar"
          element={
            <ProtectedRoute>
              <Tolovlar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/katalog"
          element={
            <ProtectedRoute>
              <Katalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/yana"
          element={
            <ProtectedRoute>
              <Yana />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
