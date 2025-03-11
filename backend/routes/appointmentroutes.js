const express = require("express");
const Appointment = require("../models/appointmentModel");
const { generateTicketId, generateQR } = require("../utils/ticketUtils");

const router = express.Router();

// ✅ Fetch Available Slots for a Given Date & Department
router.get("/available-slots", async (req, res) => {
    try {
        const { date, department } = req.query;
        if (!date || !department) {
            return res.status(400).json({ error: "Date and department are required." });
        }
        
        // Fetch booked slots
        const bookedAppointments = await Appointment.find({ date, department }).select("slot");
        const bookedSlots = bookedAppointments.map(app => app.slot);
        
        // Define all possible slots
        const allSlots = [
            "10:00 AM", "10:05 AM", "10:10 AM", "10:15 AM", "10:20 AM", "10:25 AM", "10:30 AM", "10:35 AM", "10:40 AM", "10:45 AM", "10:50 AM", "10:55 AM",
            "11:00 AM", "11:05 AM", "11:10 AM", "11:15 AM", "11:20 AM", "11:25 AM", "11:30 AM", "11:35 AM", "11:40 AM", "11:45 AM", "11:50 AM", "11:55 AM",
            "12:00 PM", "12:05 PM", "12:10 PM", "12:15 PM", "12:20 PM", "12:25 PM", "12:30 PM", "12:35 PM", "12:40 PM", "12:45 PM", "12:50 PM", "12:55 PM",
            "1:00 PM", "1:05 PM", "1:10 PM", "1:15 PM", "1:20 PM", "1:25 PM", "1:30 PM", "1:35 PM", "1:40 PM", "1:45 PM", "1:50 PM", "1:55 PM",
            "2:00 PM", "2:05 PM", "2:10 PM", "2:15 PM", "2:20 PM", "2:25 PM", "2:30 PM", "2:35 PM", "2:40 PM", "2:45 PM", "2:50 PM", "2:55 PM",
            "3:00 PM", "3:05 PM", "3:10 PM", "3:15 PM", "3:20 PM", "3:25 PM", "3:30 PM", "3:35 PM", "3:40 PM", "3:45 PM", "3:50 PM", "3:55 PM",
            "4:00 PM", "4:05 PM", "4:10 PM", "4:15 PM", "4:20 PM", "4:25 PM", "4:30 PM", "4:35 PM", "4:40 PM", "4:45 PM", "4:50 PM", "4:55 PM",
            "5:00 PM", "5:05 PM", "5:10 PM", "5:15 PM", "5:20 PM", "5:25 PM", "5:30 PM", "5:35 PM", "5:40 PM", "5:45 PM", "5:50 PM", "5:55 PM"
        ];

        // Return only available slots
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ error: "Failed to fetch available slots." });
    }
});

// ✅ Book an Appointment
router.post("/book-appointment", async (req, res) => {
    try {
        const { name, age, phone, address, department, date, slot } = req.body;

        if (!name || !age || !phone || !address || !department || !date || !slot) {
            return res.status(400).json({ error: "All fields are required." });
        }

        if (age < 1) {
            return res.status(400).json({ error: "Invalid age." });
        }

        if (!/^[0-9]+$/.test(phone)) {
            return res.status(400).json({ error: "Phone number must contain only digits." });
        }

        // Check if slot is already booked
        const existingAppointment = await Appointment.findOne({ date, slot, department });
        if (existingAppointment) {
            return res.status(400).json({ error: "This slot is already booked. Please choose another one." });
        }

        // Generate unique Ticket ID & QR Code
        const ticketId = generateTicketId();
        const qr_svg = await generateQR(ticketId);

        // Save appointment
        const newAppointment = new Appointment({ name, age, phone, address, department, date, slot, ticketId, qr_svg });
        await newAppointment.save();

        res.status(201).json({ message: "Appointment booked successfully!", ticketId, qr_svg });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ error: "Failed to book appointment. Please try again." });
    }
});

module.exports = router;