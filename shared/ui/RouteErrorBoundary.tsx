import React from 'react';
import { logger } from '@/shared/logger';
import { ErrorState } from './ErrorState';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/** Catches render errors below it, reports them, and offers a restart of the subtree. */
export class RouteErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('render error', { message: error.message, componentStack: info.componentStack });
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.error) return <ErrorState error={this.state.error} onRetry={this.reset} />;
    return this.props.children;
  }
}
