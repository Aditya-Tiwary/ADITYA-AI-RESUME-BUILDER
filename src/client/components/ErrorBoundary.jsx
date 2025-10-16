import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{
            background: "linear-gradient(90deg, #c4b5e7, #9f9dd4, #ada4e2)",
            backgroundSize: "100% 100%",
          }}
        >
          <div 
            className="max-w-md w-full rounded-2xl shadow-xl p-8 text-center border-2"
            style={{
              background: "white",
              borderColor: "#dc2626",
            }}
          >
            <div className="mb-6 relative">
              <div 
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                }}
              >
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-300 rounded-full opacity-40 animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            <h1 
              className="text-3xl font-bold mb-3"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Oops! Something went wrong
            </h1>
            
            <p 
              className="mb-8 leading-relaxed font-medium"
              style={{ color: "#374151" }}
            >
              Don't worry, these things happen! Let's get you back on track with a fresh start.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(to right, #f97316, #ea580c)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #ea580c, #c2410c)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #ea580c, #c2410c)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #f97316, #ea580c)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Go Home</span>
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full px-6 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  '&:hover': {
                    background: 'linear-gradient(to right, #059669, #047857)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #10b981, #059669)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-4 bg-white rounded border text-xs font-mono text-red-600 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;