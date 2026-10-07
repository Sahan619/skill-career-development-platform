

import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Profile from './pages/Profile/Profile';
import Skills from './pages/Skills/Skills';
import Progress from './pages/Progress/Progress';
import CareerPaths from './pages/CareerPaths/CareerPaths';
import Roadmap from './pages/Roadmap/Roadmap';
import Projects from './pages/Projects/Projects';
import Portfolio from './pages/Portfolio/Portfolio';



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
          <Route path="/progress" element={<Progress />} />
          <Route path="/career-paths" element={<CareerPaths />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/portfolio" element={<Portfolio />} />
          </Route>
         
      </Routes>
    </BrowserRouter>
       
    </>
  )
}

export default App
