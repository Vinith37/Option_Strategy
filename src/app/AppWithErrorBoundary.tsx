import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

/**
 * AppWithErrorBoundary - Wraps the main App component with error handling
 * 
 * This is the recommended way to use the app in production:
 * - Catches all React errors
 * - Prevents complete app crashes
 * - Shows user-friendly error UI
 * - Allows page reload to recover
 * 
 * Usage:
 * Import this file instead of App.tsx directly
 */
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
