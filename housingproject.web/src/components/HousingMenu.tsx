import React, { useEffect, useRef, useState } from "react";
import "./HousingMenu.css";

const menuLinks = [
  { path: "/", label: "Home" },
  { path: "/mcr-form", label: "Forms" },
  { path: "/about", label: "Reports" },
  { path: "/contact", label: "Housing Portal" },
];

interface HousingMenuProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  showMenuBar?: boolean;
}

const HousingMenu: React.FC<HousingMenuProps> = ({ 
  onLogout, 
  isOpen: externalIsOpen, 
  onToggle: externalOnToggle,
  showMenuBar = true 
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isMenuOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsMenuOpen = externalOnToggle ? 
    () => externalOnToggle() : 
    (value: boolean) => setInternalIsOpen(value);

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

  return (
    <div className="housing-menu-container" ref={container}>
      {/* menu-bar - only show if showMenuBar is true */}
      {showMenuBar && (
        <div className="housing-menu-bar">
          <div className="housing-menu-logo">
            <span>Housing Project</span>
          </div>
          <div className="housing-menu-open" onClick={toggleMenu}>
            <p>Menu</p>
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
                <div className="housing-menu-link-item-holder" onClick={toggleMenu}>
                  <a className="housing-menu-link" href={link.path}>
                    {link.label}
                  </a>
                </div>
              </div>
            ))}
            <div className="housing-menu-link-item">
              <div className="housing-menu-link-item-holder" onClick={handleLogout}>
                <a className="housing-menu-link" href="#">
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