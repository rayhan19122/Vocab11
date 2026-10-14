import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressProvider'
import { ToastProvider } from './context/ToastProvider'
import { AppShell } from './components/layout/AppShell'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Lectures = lazy(() => import('./pages/Lectures'))
const LectureDetail = lazy(() => import('./pages/LectureDetail'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Practice = lazy(() => import('./pages/Practice'))
const QuickStudy = lazy(() => import('./pages/QuickStudy'))
const WeakWords = lazy(() => import('./pages/WeakWords'))
const Progress = lazy(() => import('./pages/Progress'))
const Settings = lazy(() => import('./pages/Settings'))

export default function App() {
  return (
    <ProgressProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="lectures" element={<Lectures />} />
              <Route path="lectures/:lectureId" element={<LectureDetail />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="practice" element={<Practice />} />
              <Route path="practice/:mode" element={<Practice />} />
              <Route path="study" element={<QuickStudy />} />
              <Route path="weak" element={<WeakWords />} />
              <Route path="progress" element={<Progress />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ProgressProvider>
  )
}
