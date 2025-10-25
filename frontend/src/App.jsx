import React from 'react'
import { Routes ,Route} from 'react-router-dom'
import Homepage from './pages/HomePage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SettingPage from './pages/SettingPage.jsx'
import ProfilePage from './pages/profilePage.jsx'
import Navbar from './components/Navbar.jsx'

const App = () => {
  return (
    <div >
      <Navbar/>
      <Routes>
        <Route path="/" element= {<Homepage />}/>
        <Route path="/signup" element= {<SignUpPage />}/>
        <Route path="/login" element= {<LoginPage />}/>
        <Route path="/setting" element= {<SettingPage />}/>
        <Route path="/profile" element= {<ProfilePage />}/>
      </Routes>

      
      </div>
  )
}

export default App;