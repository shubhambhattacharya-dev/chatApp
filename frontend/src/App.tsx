import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

// Lazy loading pages for better performance
const Homepage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingPage = lazy(() => import("./pages/SettingPage"));
const ProfilePage = lazy(() => import("./pages/profilePage"));

const PageLoader = () => (
  <div className="flex justify-center items-center h-[calc(100-64px)]">
    <Loader className="size-10 animate-spin text-primary" />
  </div>
);

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="min-h-screen">
      <ErrorBoundary>
        {!["/login", "/signup"].includes(location.pathname) && <Navbar />}

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={authUser ? <Homepage /> : <Navigate to="/login" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/settings"
              element={authUser ? <SettingPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
          </Routes>
        </Suspense>

        <Toaster position="top-right" />
      </ErrorBoundary>
    </div>
  );
};

export default App;
