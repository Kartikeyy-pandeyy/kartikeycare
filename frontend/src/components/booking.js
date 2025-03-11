import React, { useState, useEffect, useRef } from "react";
import BookingPopup from "./BookingPopup.js";
import "./booking.css";

const BookingForm = ({ selectedDepartment }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: "", age: "", phone: "", address: "" });
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const formRef = useRef(null);

  // Initialize Dates (Skipping Sundays)
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (today.getDay() === 6) {
    tomorrow.setDate(today.getDate() + 2);
  } else if (today.getDay() === 0) {
    today.setDate(today.getDate() + 1);
  }

  const formatDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

  const todayString = formatDate(today);
  const tomorrowString = formatDate(tomorrow);

  useEffect(() => {
    setSelectedDate(todayString);
  }, [todayString]);

  // Fetch Available Slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDepartment || !selectedDate) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/available-slots?date=${encodeURIComponent(selectedDate)}&department=${encodeURIComponent(selectedDepartment)}`
        );

        if (!response.ok) throw new Error("Failed to fetch slots");

        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (error) {
        console.error("Error fetching slots:", error);
        alert("Error fetching available slots. Please try again.");
      }
    };

    fetchSlots();
  }, [selectedDate, selectedDepartment]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "age" && value < 1) return;
    if (name === "phone" && !/^[0-9]*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const bookAppointment = async () => {
    if (!selectedSlot) {
      alert("Please select a slot before confirming.");
      return;
    }

    if (!formData.name || !formData.age || !formData.phone || !formData.address) {
      alert("All fields are required. Please fill them in.");
      return;
    }

    const appointmentData = {
      department: selectedDepartment,
      date: selectedDate,
      slot: selectedSlot,
      ...formData,
    };

    try {
      const response = await fetch("http://localhost:5000/api/appointments/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();
      if (response.ok) {
        setTicketDetails(data);
        setShowPopup(true);
      } else {
        alert(`Booking failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div ref={formRef} className="booking-form-container">
      <h2 className="booking-title">Book an Appointment</h2>
      {selectedDepartment && (
        <p className="booking-subtitle">
          Department: <strong>{selectedDepartment}</strong>
        </p>
      )}

      <label>Date:</label>
      <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
        <option value={todayString}>Today ({todayString})</option>
        <option value={tomorrowString}>Tomorrow ({tomorrowString})</option>
      </select>

      <label>Available Slots:</label>
      <div className="slot-grid">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot, index) => (
            <button
              key={index}
              className={`slot-btn ${selectedSlot === slot ? "selected" : ""}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot}
            </button>
          ))
        ) : (
          <p>No slots available for this date.</p>
        )}
      </div>

      <label>Name:</label>
      <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
      <label>Age:</label>
      <input type="number" name="age" value={formData.age} onChange={handleFormChange} required />
      <label>Phone:</label>
      <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} required />
      <label>Address:</label>
      <textarea name="address" value={formData.address} onChange={handleFormChange} required />

      <div className="booking-buttons">
        <button onClick={bookAppointment} className="confirm-btn" disabled={!selectedSlot}>
          Confirm
        </button>
      </div>

      {showPopup && ticketDetails && (
        <div className="popup-wrapper">
          <BookingPopup ticketDetails={ticketDetails} onClose={() => setShowPopup(false)} />
        </div>
      )}
    </div>
  );
};

export default BookingForm;