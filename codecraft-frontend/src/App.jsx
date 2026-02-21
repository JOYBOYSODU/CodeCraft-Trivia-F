import { Component, lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

const AppRoutes = lazy(() => import("./routes/AppRoutes"));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, i) { console.error("App Error:", e, i); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: "#F87171", fontFamily: "monospace", background: "#0F172A", minHeight: "100vh" }}>
          <h2>Render Error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error)}{"\n"}{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: "#1E293B", color: "#F1F5F9", border: "1px solid #334155", fontFamily: "'Inter', sans-serif", fontSize: "13px" },
          success: { iconTheme: { primary: "#10B981", secondary: "#1E293B" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#1E293B" } },
        }} />
        <Suspense fallback={<Loader fullscreen text="Loading..." />}>
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}
