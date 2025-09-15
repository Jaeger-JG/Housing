import React, { useRef, useState } from "react";
import "./HousingMenu.css";

const menuLinks = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/mcr-form", label: "Forms" },
  { path: "/reports", label: "Reports" },
  { path: "/contact", label: "Housing Portal" },
];

interface HousingMenuProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  showMenuBar?: boolean;
  username?: string;
  onNavigateToForms?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToReports?: () => void;
}

const HousingMenu: React.FC<HousingMenuProps> = ({ 
  onLogout, 
  isOpen: externalIsOpen, 
  onToggle: externalOnToggle,
  showMenuBar = true,
  username,
  onNavigateToForms,
  onNavigateToDashboard,
  onNavigateToReports
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isMenuOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const toggleMenu = () => {
    if (externalOnToggle) {
      externalOnToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    if (!externalOnToggle) {
      setInternalIsOpen(false);
    }
  };

  // Get initials from username
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="housing-menu-container" ref={container}>
      {/* menu-bar - only show if showMenuBar is true */}
      {showMenuBar && (
        <div className="housing-menu-bar">
          <div className="housing-menu-logo">
            <span>Housing Project</span>
          </div>
          <div className="housing-menu-controls">
            {/* Profile Bubble */}
            {username && (
              <div className="housing-menu-profile">
                <div className="housing-menu-profile-bubble">
                  {getInitials(username)}
                </div>
                <span className="housing-menu-username">{username}</span>
              </div>
            )}
            <div className="housing-menu-open" onClick={toggleMenu}>
              <p>Menu</p>
            </div>
          </div>
        </div>
      )}

      {/* menu-overlay */}
      <div className={`housing-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        {/* menu-overlay-bar */}
        <div className="housing-menu-overlay-bar">
          <div className="housing-menu-logo">
            <span>Housing Project</span>
          </div>
          <div className="housing-menu-close">
            <p onClick={toggleMenu}>Close</p>
          </div>
        </div>

        {/* menu overlay items */}
        <div className="housing-menu-close-icon" onClick={toggleMenu}>
          <p>&#x2715;</p>
        </div>
        <div className="housing-menu-copy">
          <div className="housing-menu-links">
            {menuLinks.map((link, index) => (
              <div key={index} className="housing-menu-link-item">
                <div className="housing-menu-link-item-holder" onClick={() => {
                  toggleMenu();
                  if (link.label === 'Forms' && onNavigateToForms) {
                    onNavigateToForms();
                  } else if (link.label === 'Dashboard' && onNavigateToDashboard) {
                    onNavigateToDashboard();
                  } else if (link.label === 'Reports' && onNavigateToReports) {
                    onNavigateToReports();
                  }
                }}>
                  <a 
                    className="housing-menu-link" 
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.label === 'Forms' && onNavigateToForms) {
                        onNavigateToForms();
                      } else if (link.label === 'Dashboard' && onNavigateToDashboard) {
                        onNavigateToDashboard();
                      } else if (link.label === 'Reports' && onNavigateToReports) {
                        onNavigateToReports();
                      }
                    }}
                  >
                    {link.label}
                  </a>
                </div>
              </div>
            ))}
            <div className="housing-menu-link-item">
              <div className="housing-menu-link-item-holder" onClick={handleLogout}>
                <a className="housing-menu-link" href="/logout" onClick={(e) => e.preventDefault()}>
                  Logout
                </a>
              </div>
            </div>
          </div>
          <div className="housing-menu-info">
            <div className="housing-menu-info-col">
              <p>Manual Check Request System</p>
              <p>Housing Management</p>
            </div>
            <div className="housing-menu-info-col">
              <p>Internal Use Only</p>
              <p>Secure Access Required</p>
            </div>
          </div>
        </div>
        <div className="housing-menu-preview">
          <p>MCR System</p>
        </div>
      </div>
    </div>
  );
};

export default HousingMenu; 