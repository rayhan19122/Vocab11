import { BarChart3, BookOpen, GraduationCap, LayoutDashboard, Layers, Settings, Target } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
  { to: '/lectures', label: 'Lectures', short: 'Lectures', icon: BookOpen },
  { to: '/flashcards', label: 'Flashcards', short: 'Cards', icon: Layers },
  { to: '/practice', label: 'Practice', short: 'Practice', icon: GraduationCap },
  { to: '/weak', label: 'Weak Words', short: 'Weak', icon: Target, badge: 'weak' },
  { to: '/progress', label: 'Progress', short: 'Progress', icon: BarChart3 },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
]

// Shown in the mobile bottom bar; everything else lives behind "More".
export const MOBILE_PRIMARY = ['/', '/lectures', '/flashcards', '/practice']
