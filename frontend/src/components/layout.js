import React from "react";
import logo from "../assets/kartikey.png";
import "./layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Kartikey Care Logo" className="logo" />
        </div>
        <h1 className="hospital-name">Kartikey Care</h1>
      </header>

      <main className="content">{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-copyright">© 2025 Kartikey Care | All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;