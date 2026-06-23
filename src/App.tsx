import { useState, ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { FilterProvider } from '@/lib/filters'
import { SidebarProvider } from '@/lib/sidebar'
import { AuthProvider, useAuth } from '@/lib/auth'
import { ForecastProvider } from '@/lib/forecast'
import { ForecastModal } from '@/components/charts/ForecastModal'
import { useI18n } from '@/lib/i18n'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { FilterBar } from '@/components/layout/FilterBar'
import { AmirPanel } from '@/components/layout/AmirPanel'

import { ExecutivePage } from '@/pages/Executive'
import { RequestTypePage } from '@/pages/RequestType'
import { DepartmentsPage } from '@/pages/Departments'
import { UploadPage } from '@/pages/Upload'
import { SettingsPage } from '@/pages/Settings'
import { AmirPage } from '@/pages/Amir'
import { CapacityPage } from '@/pages/Capacity'
import { LoginPage } from '@/pages/Login'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return <>{children}</>
}

function Shell() {
  const [drawer, setDrawer] = useState(false)
  useI18n()
  return (
    <ForecastProvider>
    <SidebarProvider>
      <FilterProvider>
        <div className="flex min-h-screen relative">
          <button
            onClick={() => setDrawer(true)}
            className="md:hidden fixed top-3 left-3 z-40 size-10 grid place-items-center rounded-xl glass">
            <Menu className="size-5" />
          </button>

          <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200
            ${drawer ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <Sidebar />
            <button
              onClick={() => setDrawer(false)}
              className="md:hidden absolute top-3 right-3 size-8 grid place-items-center rounded-lg hover:bg-white/40 dark:hover:bg-white/5">
              <X className="size-4" />
            </button>
          </div>
          {drawer && (
            <div onClick={() => setDrawer(false)} className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <FilterBar />
            <main className="flex-1 p-4 sm:p-6 overflow-x-hidden pn-scroll">
              <Routes>
                <Route path="/" element={<ExecutivePage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/capacity" element={<CapacityPage />} />
                <Route path="/request-type/:code" element={<RequestTypePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/amir" element={<AmirPage />} />
                <Route path="/amin" element={<AmirPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <AmirPanel />
          <ForecastModal />
        </div>
      </FilterProvider>
    </SidebarProvider>
    </ForecastProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<RequireAuth><Shell /></RequireAuth>} />
      </Routes>
    </AuthProvider>
  )
}
