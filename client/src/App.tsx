

import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Profile from './pages/Profile/Profile';
import Skills from './pages/Skills/Skills';




function App() {
  

  return ( 
    
    <>
    <BrowserRouter>
      <Routes>
        
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<Skills />} />
          </Route>
         
      </Routes>
    </BrowserRouter>
       
    </>
  )
}

export default App
