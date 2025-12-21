import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import Landingpage from './Landingpage';
import { Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import NoPage from './components/NoPage';
import './App.css';

function App() {

  const [loading,setLoading] = useState (true);
  const [authToken, setAuthToken] = useState(localStorage.getItem('jwtToken') || null);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    return authToken ? element : <Navigate to="/login" replace />;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  if (loading){
    return (
      <div className='logo-loader'>
        <img src="./TaskManagerLogo.png" alt="TaskManager logo" className='task-manager-logo'/>
        <div className="logo-text"><span className='first-part'>Task</span><span className='second-part'>Manager</span></div>
      </div>
    )
  }
  return (
    
      <div className='App'>
        <BrowserRouter>
        <Routes>
          {/* Main route shows all sections as single page */}
          <Route path="/" element={<Landingpage />} />
          <Route
            path='/UserDashboard'
            element={<PrivateRoute element={<UserDashboard setAuthToken={setAuthToken} />} />}
          />
          
          {/* Separate routes for auth pages */}
          <Route
            path="/login"
            element={
              authToken ? (
                <Navigate to={"/UserDashboard"} replace />
              ) : (
                <Login setAuthToken={setAuthToken} />
              )
            }
          />

          <Route
            path="/signup"
            element={
              authToken ? (
                <Navigate to={"/UserDashboard"} replace />
              ) : (
                <Signup />
              )
            }
          />
          
          <Route path="*" element={<NoPage />} />
          
        </Routes>
        </BrowserRouter>  
      </div>
    
  )
}

export default App