import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, CssBaseline, Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HousingMenu from './HousingMenu';

interface NavbarProps {
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="start"
            onClick={toggleMenu}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Vallejo Housing Management
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Housing Menu Overlay */}
      <HousingMenu onLogout={handleLogout} isOpen={isMenuOpen} onToggle={toggleMenu} showMenuBar={false} />
    </>
  );
};

export default Navbar; 