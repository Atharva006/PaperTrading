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
    console.error('Uncaught component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFCFC] text-[#111114] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl border border-[#D9E2F2]">
            <div className="w-12 h-12 rounded-2xl bg-[#D92D20]/10 border border-[#D92D20]/20 text-[#D92D20] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-bold text-[#00225A] mb-2">Something went wrong</h2>
            <p className="text-xs text-[#6B7A90] mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred in the workspace.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-[#00225A] hover:bg-[#536CF0] text-white px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
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