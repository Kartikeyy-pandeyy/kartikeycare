import React, { useState, useEffect, useRef, useMemo } from "react";
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

  const { todayString, tomorrowString } = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // If today is Sunday, set today to Monday
    if (today.getDay() === 0) {
      today.setDate(today.getDate() + 1);
      tomorrow.setDate(today.getDate() + 1);
    }

    // If tomorrow is Sunday, set tomorrow to Monday
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    const formatDate = (date) =>
      `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

    return { todayString: formatDate(today), tomorrowString: formatDate(tomorrow) };
  }, []);

  useEffect(() => {
    setSelectedDate(todayString);
  }, [todayString]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDepartment || !selectedDate) return;
      try {
        const response = await fetch(
          `https://kartikeycare-backend.railway.app/api/appointments/available-slots?date=${encodeURIComponent(selectedDate)}&department=${encodeURIComponent(selectedDepartment)}`
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
    if (name === "age" && (value < 1 || value > 150)) return;
    if (name === "phone" && !/^[0-9]*$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return alert("Please select a slot.");
    if (!formData.name || !formData.age || !formData.phone || !formData.address) {
      return alert("All fields are required.");
    }

    const appointmentData = { department: selectedDepartment, date: selectedDate, slot: selectedSlot, ...formData };
    try {
      const response = await fetch("https://kartikeycare-backend.railway.app/api/appointments/book-appointment", {
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
    <form ref={formRef} className="booking-form">
      <h2 className="booking-title">Book an Appointment</h2>
      {selectedDepartment && (
        <p className="booking-subtitle">
          Department: <span>{selectedDepartment}</span>
        </p>
      )}

      <label>Date</label>
      <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
        <option value={todayString}>{todayString}</option>
        <option value={tomorrowString}>{tomorrowString}</option>
      </select>

      <label>Available Slots</label>
      <div className="slot-grid">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot, index) => (
            <button
              key={index}
              type="button" // Prevent form submission
              className={`slot-btn ${selectedSlot === slot ? "selected" : ""}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {slot}
            </button>
          ))
        ) : (
          <p>No slots available.</p>
        )}
      </div>

      <label>Name</label>
      <input type="text" name="name" value={formData.name} onChange={handleFormChange} />
      <label>Age</label>
      <input type="number" name="age" value={formData.age} onChange={handleFormChange} />
      <label>Phone</label>
      <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} maxLength="10" />
      <label>Address</label>
      <textarea name="address" value={formData.address} onChange={handleFormChange} />

      <button type="button" onClick={bookAppointment} className="confirm-btn" disabled={!selectedSlot}>
        Confirm
      </button>

      {showPopup && ticketDetails && (
        <div className="popup-wrapper">
          <BookingPopup ticketDetails={ticketDetails} onClose={() => setShowPopup(false)} />
        </div>
      )}
    </form>
  );
};

export default BookingForm;