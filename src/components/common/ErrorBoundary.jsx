import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

/** Catches render errors in a page so one bug never blanks the whole app. */
export class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('Vocab11 page error:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        action={<Button onClick={() => window.location.reload()}>Reload the app</Button>}
      >
        Your progress is safe. Reload to try again.
      </EmptyState>
    )
  }
}
