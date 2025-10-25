import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Homepage from './pages/HomePage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SettingPage from './pages/SettingPage.jsx'
import ProfilePage from './pages/profilePage.jsx'
import Navbar from './components/Navbar.jsx'
import { useAuthStore } from './store/useAuthStore.js'
import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(authUser);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin-slow" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <Homepage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ?<SignUpPage />: <Navigate to="/" />} />
        <Route path="/login" element={ !authUser ?<LoginPage />: <Navigate to="/" />} />
        <Route path="/setting" element={authUser ? <SettingPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster/>
    </div>
  );
};

export default App;
