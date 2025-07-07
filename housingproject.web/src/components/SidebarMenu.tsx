import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { 
  Description, 
  Dashboard,
  Business,
  Security,
  Close,
  Menu
} from '@mui/icons-material';
import './SidebarMenu.css';

interface SidebarMenuProps {
  onNavigateToForm: () => void;
  onNavigateToDashboard: () => void;
  onLogout?: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  onNavigateToForm, 
  onNavigateToDashboard,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const menuCards = [
    {
      id: 'SharePoint',
      title: 'SharePoint',
      description: 'Access Housing & Departments Sharepoint',
      icon: <Description sx={{ fontSize: 30, color: 'inherit' }} />,
      action: onNavigateToForm
    },
    {
      id: 'Housing Pro',
      title: 'Housing Pro',
      description: 'Navigate to Housing Pro',
      icon: <Dashboard sx={{ fontSize: 30, color: 'inherit' }} />,
      action: onNavigateToDashboard
    },
    {
      id: 'Form Management',
      title: 'Form Management',
      description: 'Manage Forms & Audit',
      icon: <Business sx={{ fontSize: 30, color: 'inherit' }} />,
      action: () => console.log('Management clicked')
    },
    {
      id: 'logout',
      title: 'Logout',
      description: 'Securely log out of the housing management system',
      icon: <Security sx={{ fontSize: 30, color: 'inherit' }} />,
      action: onLogout || (() => console.log('Logout clicked'))
    }
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleCardClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <Box 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        sx={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          width: '250px',
          height: '150px',
          margin: '0.75em',
          padding: '1em',
          borderRadius: '0.5em',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          }
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Community
        </Typography>
        <Menu sx={{ fontSize: 30 }} />
      </Box>

      {/* Sidebar */}
      <Box 
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'open' : ''}`}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: { xs: '100vw', md: '30vw' },
          height: '100vh',
          padding: '0.75em',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75em',
          overflow: 'hidden',
          pointerEvents: isOpen ? 'all' : 'none',
          zIndex: 1000,
        }}
      >
        {menuCards.map((card, index) => (
          <Paper
            key={card.id}
            ref={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
            className={`sidebar-card ${isOpen ? 'slide-in' : 'slide-out'}`}
            onClick={() => handleCardClick(card.action)}
            sx={{
              position: 'relative',
              padding: '1em',
              flex: 1,
              background: '#fff',
              color: '#000',
              borderRadius: '0.5em',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: 'translateX(110%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                transform: 'translateX(110%) scale(1.02)',
              },
              '&.slide-in': {
                transform: 'translateX(0%)',
                transitionDelay: `${index * 0.075}s`,
              },
              '&.slide-out': {
                transform: 'translateX(110%)',
                transitionDelay: '0s',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 400,
                  letterSpacing: '-0.035em',
                  lineHeight: 1
                }}
              >
                {card.title}
              </Typography>
              {index === 0 && (
                <Close 
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  sx={{
                    fontSize: '2rem',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                    }
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {card.icon}
            </Box>
            
            <Typography 
              className="card-description"
              variant="body2" 
              sx={{ 
                fontSize: '0.9rem',
                lineHeight: 1.5,
                opacity: 0,
                transform: 'translateY(20px)',
                transition: 'all 0.3s ease',
                '.sidebar-card:hover &': {
                  opacity: 1,
                  transform: 'translateY(0px)',
                }
              }}
            >
              {card.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Background Blur Overlay */}
      {isOpen && (
        <Box
          className="background-blur"
          onClick={() => setIsOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(15px)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease',
          }}
        />
      )}
    </>
  );
};

export default SidebarMenu; 