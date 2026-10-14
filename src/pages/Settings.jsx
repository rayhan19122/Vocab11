import { DAILY_GOALS, THEMES } from '../utils/storage'
import { useProgress } from '../hooks/useProgress'
import { Card, SectionHeader } from '../components/common/Card'
import { Segmented, TextInput, Toggle } from '../components/common/Field'
import { PageHeader } from '../components/common/PageHeader'
import { DataTools } from '../components/settings/DataTools'
import { usePageTitle } from '../hooks/usePageTitle'

const THEME_LABELS = { system: 'System', light: 'Light', dark: 'Dark' }

export default function Settings() {
  usePageTitle('Settings')
  const { state, actions } = useProgress()
  const { settings } = state

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" description="Everything is stored on this device. There is no account and nothing is sent anywhere." />
      <div className="grid max-w-2xl gap-6">
        <Card className="grid gap-6">
          <SectionHeader title="Profile" />
          <TextInput label="Your name" value={settings.name} maxLength={30} onChange={(event) => actions.updateSettings({ name: event.target.value })} onBlur={(event) => !event.target.value.trim() && actions.updateSettings({ name: 'Rayhan' })} />
        </Card>

        <Card className="grid gap-6">
          <SectionHeader title="Appearance & goals" />
          <Segmented legend="Theme" options={THEMES.map((theme) => ({ value: theme, label: THEME_LABELS[theme] }))} value={settings.theme} onChange={(theme) => actions.updateSettings({ theme })} columns="grid-cols-3" />
          <Segmented legend="Daily goal (words per day)" options={DAILY_GOALS.map((goal) => ({ value: goal, label: String(goal) }))} value={settings.dailyGoal} onChange={(dailyGoal) => actions.updateSettings({ dailyGoal })} />
          <Toggle label="Sound effects" description="Short tones for correct, wrong and finished." checked={settings.sound} onChange={(sound) => actions.updateSettings({ sound })} />
        </Card>

        <Card className="grid gap-5">
          <SectionHeader title="Your data" />
          <p className="text-muted">Export a backup to move your progress to another browser or device, or import one to restore it.</p>
          <DataTools />
        </Card>
      </div>
    </>
  )
}
