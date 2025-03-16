import React from "react";
import "./popup.css";

const BookingPopup = ({ ticketDetails, onClose }) => {
  if (!ticketDetails) return null;

  const handleDownload = () => {
    try {
      console.log(`Downloading OPD Ticket for: ${ticketDetails.ticketId}`);

      // Open the download link in a new tab to avoid CORS/security issues
      window.open(
        `https://kartikeycare-backend-production.up.railway.app/api/opd/generate-ticket/${ticketDetails.ticketId}`,
        "_blank"
      );

      console.log(`OPD Ticket for ${ticketDetails.ticketId} download initiated.`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Error generating OPD Ticket. Please try again.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Appointment Confirmed!</h2>
        <p>Your appointment has been successfully booked.</p>
        <p>
          <strong>Appointment ID:</strong> {ticketDetails.ticketId}
        </p>
        <p className="advice-text">
          Your OPD ticket has been generated. Please download and keep it safely as you will need to show it at the OPD gate.
        </p>
        <div className="popup-buttons">
          <button className="download-btn" onClick={handleDownload}>
            Download OPD Ticket
          </button>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPopup;
