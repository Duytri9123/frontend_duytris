'use client'
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-lg font-medium text-destructive">Đã xảy ra lỗi</p>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message ?? 'Vui lòng thử lại sau.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Thử lại
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
