import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { 
  Description, 
  Dashboard,
  Business,
  Security,
  Assignment
} from '@mui/icons-material';
import HousingMenu from './HousingMenu';
import SidebarMenu from './SidebarMenu';

interface LandingPageProps {
  onNavigateToForm: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToFormsList: () => void;
  onLogout?: () => void;
  username?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToForm, 
  onNavigateToDashboard,
  onNavigateToFormsList,
  onLogout,
  username
}) => {
  const features = [
    {
      icon: <Assignment sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Forms',
      description: 'Create and manage MCR forms and documentation',
      onClick: onNavigateToForm
    },
    {
      icon: <Description sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Task List',
      description: 'Approve and manage Forms with digital signatures',
      onClick: onNavigateToFormsList

    },
    {
      icon: <Dashboard sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Housing Portal',
      description: 'View and track all housing requests and administrative tasks',
      onClick: onNavigateToDashboard
    },
    {
      icon: <Business sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Reports',
      description: 'Streamlined Reports for efficient housing administration'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Housing Applications',
      description: 'Internal Applications For Housing Workflows'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Housing Menu */}
      <HousingMenu onLogout={onLogout} username={username} onNavigateToForms={onNavigateToFormsList} onNavigateToDashboard={onNavigateToDashboard} />
      
      {/* Sidebar Menu */}
      <SidebarMenu 
        onNavigateToForm={onNavigateToForm}
        onNavigateToDashboard={onNavigateToDashboard}
        onLogout={onLogout}
        username={username}
      />
      
      {/* Hero Section */}
      <Box sx={{
        pt: 15,
        pb: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Vallejo Housing Management
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              fontWeight: 300,
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Streamlined tools for efficient housing administration and tenant services
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Description />}
              onClick={onNavigateToForm}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Create MCR Form
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Dashboard />}
              onClick={onNavigateToDashboard}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: '#ffffff',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              View Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 4 
        }}>
          {features.map((feature, index) => (
            <Paper 
              key={index}
              elevation={2}
              onClick={feature.onClick}
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                cursor:'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 4,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                }
              }}
            >
              <Box sx={{ mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: '#667eea'
                }}
              >
                {feature.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  lineHeight: 1.6
                }}
              >
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Quick Actions Section */}
      <Box sx={{ 
        background: '#f8f9fa', 
        py: 8,
        borderTop: '1px solid #e0e0e0'
      }}>
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center', 
              mb: 4, 
              fontWeight: 600,
              color: '#667eea'
            }}
          >
            Quick Actions
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Description />}
              onClick={onNavigateToForm}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                }
              }}
            >
              New MCR Form
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Dashboard />}
              onClick={onNavigateToDashboard}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#1565c0',
                  background: 'rgba(25, 118, 210, 0.1)',
                }
              }}
            >
              Access Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: '#ffffff', 
        py: 4,
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 Vallejo Housing Management System. Internal use only.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
            Manual Check Request (MCR) System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 