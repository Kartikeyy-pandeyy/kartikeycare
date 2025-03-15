const express = require("express");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const Appointment = require("../models/appointmentModel");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Generate OPD Ticket PDF (GET request)
router.get("/generate-ticket/:ticketId", async (req, res) => {
    try {
        const { ticketId } = req.params;
        console.log("Received request for ticket:", ticketId);

        // Fetch appointment details from MongoDB
        const appointment = await Appointment.findOne({ ticketId });

        if (!appointment) {
            console.log("❌ Ticket not found in database:", ticketId);
            return res.status(404).json({ error: "Appointment not found" });
        }

        console.log("✅ Appointment found:", appointment);

        const { name, age, phone, address, department, date, slot } = appointment;

        // Generate QR Code as Base64 Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(ticketId, { margin: 2, width: 150 });

        // Create PDF Document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 850]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Read the background image as a local file
        const backgroundImagePath = path.join(__dirname, "../assets/kartikey.png"); // Adjust the path to your local image
        const backgroundImageBytes = fs.readFileSync(backgroundImagePath);
        const backgroundImage = await pdfDoc.embedPng(backgroundImageBytes);
        
        // Draw the background image as a watermark
        page.drawImage(backgroundImage, { x: 0, y: 0, width, height, opacity: 0.9 });

        // Add Header with Styling
        const text = "OPD Ticket";
const textWidth = font.widthOfTextAtSize(text, 26);
const centerX = (width - textWidth) / 2;

page.drawText(text, {
    x: centerX,  // Centered dynamically
    y: height - 60,
    size: 26,
    font,
    color: rgb(0.6, 0.3, 0.1),  // Brown color
    opacity: 0.9,
});

        // Draw a line separator
        page.drawLine({
            start: { x: 50, y: height - 75 },
            end: { x: 550, y: height - 75 },
            thickness: 2,
            color: rgb(0, 0, 0),
        });

        // User Details Section
        // User Details Section
const details = [
    `Name: ${name}`,
    `Age: ${age}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    `Department: ${department}`,
    `Date: ${date}`,
    `Slot: ${slot}`,
    `Ticket ID: ${ticketId}`,
];

let yPosition = height - 120;
details.forEach((text, index) => {
    page.drawText(text, {
        x: 50,
        y: yPosition,
        size: 14,
        font,
        color: rgb(0, 0, 0),
    });
    yPosition -= 25;
    // Add extra line after Address (index 3 in the details array)
    if (index === 3) {
        yPosition -= 25; // Move down by an additional line after Address
    }
});


        // Embed QR Code directly from the base64 data URL
        const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
        page.drawImage(qrImage, { x: 400, y: height - 250, width: 150, height: 150 });

        // Draw a vertical line between user details and QR code
        page.drawLine({
            start: { x: 350, y: height - 120 },
            end: { x: 350, y: yPosition },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // General Advice Section
        const advice = [
            "1. Please reach the hospital 15 minutes before your slot.",
            "2. Carry your ID proof and previous medical records.",
            "3. Maintain social distancing and follow COVID guidelines.",
            "4. Contact reception for any queries.",
            "5. Thank you for choosing Kartikey Care!",
        ];

        page.drawText("General Advice & Visit Guidelines:", {
            x: 50,
            y: yPosition - 40,
            size: 16,
            font,
            color: rgb(1, 0, 0),
        });

        yPosition -= 70;
        advice.forEach((text) => {
            page.drawText(text, {
                x: 50,
                y: yPosition,
                size: 12,
                font,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
        });

        // Draw footer
        page.drawText("Kartikey Care Hospital - Gorakhpur", {
            x: 50,
            y: 50,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });

        page.drawText("Contact: +91 7388109688 | https://kartikeycare.vercel.app/", {
            x: 50,
            y: 35,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        // Send the PDF back to the client as an attachment
        res.setHeader("Content-Disposition", `attachment; filename=OPD_Ticket_${ticketId}.pdf`);
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(pdfBytes));
        
    } catch (error) {
        console.error("❌ Error generating OPD Ticket PDF:", error);
        res.status(500).json({ error: "Failed to generate OPD Ticket" });
    }
});

module.exports = router;
