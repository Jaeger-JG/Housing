import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MCRForm from './components/MCRForm';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import FormsList from './components/FormsList';

function App() {
  const [selectedForm, setSelectedForm] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setLoginError('');

    try {
      // Check if this is Windows Authentication
      if (password === 'windows-auth') {
        // Windows Auth was successful, user is already authenticated
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('authType', 'windows');
      } else {
        // Fallback to manual authentication (for development/testing)
        if (username === 'admin' && password === 'password123') {
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('authType', 'manual');
        } else {
          setLoginError('Invalid username or password. Please try again.');
        }
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('authType');
  };

  const handleNavigateToForm = () => {
    setSelectedForm('mcr');
  };

  const handleNavigateToDashboard = () => {
    setSelectedForm('dashboard');
  };

  const handleNavigateToFormsList = () => {
    setSelectedForm('forms-list');
  };

  const handleNavigateBack = () => {
    setSelectedForm('landing');
  };

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const authType = localStorage.getItem('authType');
      
      if (authStatus === 'true') {
        if (authType === 'windows') {
          // For Windows Auth, verify the session is still valid
          try {
            const response = await fetch('/api/auth/user', {
              credentials: 'include',
            });
            
            if (response.ok) {
              setIsAuthenticated(true);
            } else {
              // Windows Auth session expired, clear storage
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('username');
              localStorage.removeItem('authType');
            }
          } catch (error) {
            // Network error, clear storage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
            localStorage.removeItem('authType');
          }
        } else {
          // Manual authentication, restore session
          setIsAuthenticated(true);
        }
      }
    };

    checkAuthentication();
  }, []);

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  // If landing page is selected, show it without the layout
  if (selectedForm === 'landing') {
    return (
      <LandingPage 
        onNavigateToForm={handleNavigateToForm}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToFormsList={handleNavigateToFormsList}
        onLogout={handleLogout}
      />
    );
  }

  // If forms list is selected, show it without the layout
  if (selectedForm === 'forms-list') {
    return (
      <FormsList onNavigateBack={handleNavigateBack} />
    );
  }

  return (
    <Layout onFormSelect={setSelectedForm} onLogout={handleLogout}>
      {selectedForm === 'mcr' && <MCRForm />}
      {selectedForm === 'dashboard' && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Dashboard</h2>
          <p>Dashboard functionality coming soon...</p>
          <button onClick={() => setSelectedForm('landing')}>Back to Landing Page</button>
        </div>
      )}
      {/* Add more forms here as needed */}
    </Layout>
  );
}

export default App;
