"use client";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // 1. Add a 'dismissed' state
    this.state = { hasError: false, error: null, dismissed: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 2. If you click dismiss, shrink the giant overlay into a tiny banner
      if (this.state.dismissed) {
        return (
          <div className="p-2 bg-red-100 text-red-600 text-center text-sm">
            Error Boundary Active - Page content unmounted.
            <button
              onClick={() => window.location.reload()}
              className="ml-4 underline font-bold"
            >
              Reload
            </button>
          </div>
        );
      }

      // 3. Your normal giant UI
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center relative">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              خطا در بارگذاری
            </h2>
            <p className="text-gray-600 mb-6">
              متأسفانه خطایی در سایت رخ داده است. لطفاً صفحه را بازخوانی کنید.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
              >
                بازخوانی صفحه
              </button>

              {/* 4. Add the button to hide this overlay so you can inspect! */}
              <button
                onClick={() => this.setState({ dismissed: true })}
                className="text-gray-400 hover:text-gray-600 text-sm underline mt-2"
              >
                Dismiss to Inspect DOM
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Technical Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.toString()}
                </pre>
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
