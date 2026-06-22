import { Routes, Route, Navigate } from 'react-router-dom'
import { FilterProvider } from '@/lib/filters'
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
  return (
    <FilterProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <FilterBar />
          <main className="flex-1 p-5 overflow-x-hidden">
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
