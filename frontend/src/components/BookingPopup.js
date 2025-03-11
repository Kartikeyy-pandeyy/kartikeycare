import React from "react";
import "./popup.css";

const BookingPopup = ({ ticketDetails, onClose }) => {
  if (!ticketDetails) return null;

  const handleDownload = async () => {
    try {
        console.log(`Downloading OPD Ticket for: ${ticketDetails.ticketId}`);

        const response = await fetch(`http://localhost:5000/api/opd/generate-ticket/${ticketDetails.ticketId}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to generate OPD ticket. Status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create and trigger a hidden download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `OPD_Ticket_${ticketDetails.ticketId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);
        console.log(`OPD Ticket for ${ticketDetails.ticketId} downloaded successfully.`);
        
    } catch (error) {
        console.error("Download failed:", error);
        alert("❌ Error generating OPD Ticket. Please try again.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2> Appointment Confirmed! </h2>
        <p>Your appointment has been successfully booked.</p>
        <p><strong>Appointment ID:</strong> {ticketDetails.ticketId}</p>
        <p className="advice-text">
           Your OPD ticket has been generated. Please download and keep it safely as you will need to show it at the OPD gate.
        </p>
  
        <div className="popup-buttons">
          <button className="download-btn" onClick={handleDownload}>📥 Download OPD Ticket</button>
          <button className="close-btn" onClick={onClose}>❌ Close</button>
        </div>
      </div>
    </div>
  );
  
};

export default BookingPopup;
