import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in Cendrix Capital platform:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1424] text-[#F5F5F2] flex items-center justify-center p-6">
          <div className="max-w-md w-full cendrix-card rounded-xl p-8 text-center shadow-2xl border border-[#14223A]">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#F5F5F2] mb-2">Something went wrong</h2>
            <p className="text-xs text-[#A1A8B3] mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred in the workspace.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 btn-cendrix-gold px-5 py-2.5 text-xs font-bold rounded-lg shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
