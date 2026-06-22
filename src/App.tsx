import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { FilterProvider } from '@/lib/filters'
import { useI18n } from '@/lib/i18n'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { FilterBar } from '@/components/layout/FilterBar'
import { AminPanel } from '@/components/layout/AminPanel'

import { ExecutivePage } from '@/pages/Executive'
import { RequestTypePage } from '@/pages/RequestType'
import { DepartmentsPage } from '@/pages/Departments'
import { UploadPage } from '@/pages/Upload'
import { SettingsPage } from '@/pages/Settings'
import { AminPage } from '@/pages/Amin'
import { CapacityPage } from '@/pages/Capacity'

export default function App() {
  const [drawer, setDrawer] = useState(false)
  // ensure t() context is initialized (touches i18n)
  useI18n()
  return (
    <FilterProvider>
      <div className="flex min-h-screen relative">
        {/* mobile drawer trigger */}
        <button onClick={() => setDrawer(true)}
          className="md:hidden fixed top-3 left-3 z-40 size-10 grid place-items-center rounded-lg bg-card border border-border shadow">
          <Menu className="size-5" />
        </button>

        {/* sidebar: always on md+, drawer on mobile */}
        <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200
          ${drawer ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Sidebar />
          <button onClick={() => setDrawer(false)}
            className="md:hidden absolute top-3 right-3 size-8 grid place-items-center rounded hover:bg-white/10 text-sidebar-foreground">
            <X className="size-4" />
          </button>
        </div>
        {drawer && (
          <div onClick={() => setDrawer(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <FilterBar />
          <main className="flex-1 p-3 sm:p-5 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<ExecutivePage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/capacity" element={<CapacityPage />} />
              <Route path="/request-type/:code" element={<RequestTypePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/amin" element={<AminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <AminPanel />
      </div>
    </FilterProvider>
  )
}
