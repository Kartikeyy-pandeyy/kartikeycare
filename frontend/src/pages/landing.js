// LandingPage.jsx (unchanged structurally, just for reference)
import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout";
import "../style/landing.css";

const LandingPage = () => {
  return (
    <Layout>
      <div className="landing-wrapper">
        <h2 className="landing-title">Welcome to Kartikey Care</h2>
        <p className="landing-text">
          Kartikey Care is a hospital that exists nowhere! It offers a real-time OPD slot booking system with live CRUD operations and instant receipt generation. Built using the MERN stack, it ensures seamless booking, real-time updates, and a smooth user experience. Experience the future of virtual healthcare today!
        </p>
        <Link to="/departments">
          <button className="book-appointment">Book Appointment</button>
        </Link>
      </div>
    </Layout>
  );
};

export default LandingPage;