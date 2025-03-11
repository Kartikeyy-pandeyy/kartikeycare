import React from "react";
import logo from "../assets/kartikey.png";
import "./layout.css"; // Import external CSS

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Kartikey Care Logo" className="logo" />
        </div>
        <h1 className="hospital-name">Kartikey Care</h1>
      </header>

      {/* Main Content */}
      <main className="content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-copyright">© 2025 Kartikey Care | All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
