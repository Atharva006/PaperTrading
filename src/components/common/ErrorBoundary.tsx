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
        <div className="min-h-screen bg-[#07090e] text-[#f0f3f8] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0d111a] border border-[#1e2638] rounded-xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#df514c]/10 border border-[#df514c]/30 text-[#df514c] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-[#f0f3f8] mb-2">Something went wrong</h2>
            <p className="text-xs text-[#788296] mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred in the workspace.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#387ed1] hover:bg-[#2c6cb5] text-white text-xs font-medium rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
