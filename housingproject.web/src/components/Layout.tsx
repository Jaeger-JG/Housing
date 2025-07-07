import React, { useState } from 'react';
import { CssBaseline, Box } from '@mui/material';
import FormSidebar from './FormSidebar';

interface LayoutProps {
  children: React.ReactNode;
  onFormSelect: (form: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onFormSelect, onLogout }) => {
  const [selectedFormType, setSelectedFormType] = useState('mcr');

  const handleFormSelect = (formId: string) => {
    setSelectedFormType(formId);
    onFormSelect(formId);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Box sx={{ 
        width: 280, 
        flexShrink: 0, 
        pl: 0, // No left padding - flush against left side
        pr: 0, // No right padding
        display: { xs: 'none', md: 'block' }, // Hide on mobile
        pt: 2 // Top padding to account for any header
      }}>
        <FormSidebar 
          selectedForm={selectedFormType}
          onFormSelect={handleFormSelect}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        pr: 40, // Right padding for content
        pl: 40, // Left padding to create space from sidebar
        minWidth: 0, // Allow content to shrink
        pt: 2 // Top padding to account for any header
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 