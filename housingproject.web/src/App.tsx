import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MCRForm from './components/MCRForm';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import FormsList from './components/FormsList';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedForm, setSelectedForm] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [editingFormData, setEditingFormData] = useState(null);

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
      } else if (password === 'domain-auth') {
        // Domain authentication was successful
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('authType', 'domain');
      } else {
        // This should not happen with the new login flow
        setLoginError('Authentication failed. Please try again.');
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

  const handleNavigateToEditForm = (formData: any) => {
    setEditingFormData(formData);
    setSelectedForm('mcr');
  };

  const handleNavigateToFormDetails = (formId: number) => {
    // For now, just navigate to forms list where details can be viewed
    setSelectedForm('forms-list');
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
            const response = await fetch('http://192.168.10.52:8080/api/auth/user', {
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
        username={localStorage.getItem('username') || undefined}
      />
    );
  }

  // If forms list is selected, show it without the layout
  if (selectedForm === 'forms-list') {
    return (
      <FormsList onNavigateBack={handleNavigateBack} />
    );
  }

  // If dashboard is selected, show it without the layout
  if (selectedForm === 'dashboard') {
    return (
      <Dashboard 
        onNavigateToForm={handleNavigateToForm}
        onNavigateToFormsList={handleNavigateToFormsList}
        onNavigateToEditForm={handleNavigateToEditForm}
        onNavigateToFormDetails={handleNavigateToFormDetails}
        onNavigateBack={handleNavigateBack}
        onLogout={handleLogout}
        username={localStorage.getItem('username') || undefined}
      />
    );
  }

  return (
    <Layout 
      onFormSelect={setSelectedForm} 
      onLogout={handleLogout}
    >
      {selectedForm === 'mcr' && (
        <MCRForm 
          editingFormData={editingFormData} 
          onFormSubmitted={() => setEditingFormData(null)}
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToFormsList={handleNavigateToFormsList}
          onLogout={handleLogout}
        />
      )}
      {/* Add more forms here as needed */}
    </Layout>
  );
}

export default App;
