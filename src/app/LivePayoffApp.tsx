import { LivePayoffDemo } from "./components/LivePayoffDemo";

/**
 * LivePayoffApp - Standalone app for the Live Payoff Diagram demo
 * 
 * To use this instead of the main app, update index.tsx:
 * 
 * import { LivePayoffApp } from './app/LivePayoffApp';
 * root.render(<LivePayoffApp />);
 * 
 * Or keep the main app and add a route/toggle to show this demo.
 */

export function LivePayoffApp() {
  return <LivePayoffDemo />;
}

export default LivePayoffApp;
