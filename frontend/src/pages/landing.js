import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout"; // Import the Layout component
import "../style/landing.css"; // Import the CSS file

const LandingPage = () => {
  return (
    <Layout>
      <div className="landing-content">
        <h2 className="landing-title">Welcome to Kartikey Care</h2>
        <p className="landing-text">
          Kartikey Care is a hospital that exists nowhere! It offers a real-time OPD slot booking system with live CRUD operations and instant receipt generation. Built using the MERN stack, it ensures seamless booking, real-time updates, and a smooth user experience. Experience the future of virtual healthcare today!
        </p>

        {/* Book Appointment Button */}
        <Link to="/departments" className="button-container">
          <button className="book-appointment grey-box-button">Book Appointment</button>
        </Link>
      </div>
    </Layout>
  );
};

export default LandingPage;