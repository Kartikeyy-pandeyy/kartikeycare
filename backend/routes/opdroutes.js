const express = require("express");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const Appointment = require("../models/appointmentModel");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Color Palette
const COLORS = {
  DARK_BROWN: rgb(0.29, 0.18, 0.12), // #4A2F1F
  MEDIUM_BROWN: rgb(0.45, 0.33, 0.24), // #735439
  SOFT_BROWN: rgb(0.35, 0.25, 0.18), // #59402E
  LIGHT_BROWN: rgb(0.55, 0.42, 0.31), // #8C6B4F
  MEDIUM_BEIGE: rgb(0.71, 0.58, 0.45), // #B59573
  LIGHT_BEIGE: rgb(0.96, 0.91, 0.83), // #F5E8D3
  BEIGE: rgb(0.85, 0.75, 0.65), // #D9C0A5
  WHITE: rgb(1, 1, 1),
  BLACK: rgb(0, 0, 0),
  GRAY: rgb(0.5, 0.5, 0.5),
};

// Utility Functions
const drawDashedLine = (page, start, end, thickness, color, dashArray = [5, 5], opacity = 1) => {
  page.drawLine({ start, end, thickness, color, dashArray, opacity });
};

const drawRoundedRectangle = (page, x, y, width, height, radius, options) => {
  const { borderWidth, borderColor, color, opacity, borderOpacity } = options;
  page.drawRectangle({ x, y, width, height, borderWidth, borderColor, color, opacity, borderOpacity });
  page.drawCircle({ x: x + radius, y: y + radius, size: radius / 2, color: borderColor, opacity: 0.5 });
  page.drawCircle({ x: x + width - radius, y: y + radius, size: radius / 2, color: borderColor, opacity: 0.5 });
  page.drawCircle({ x: x + radius, y: y + height - radius, size: radius / 2, color: borderColor, opacity: 0.5 });
  page.drawCircle({ x: x + width - radius, y: y + height - radius, size: radius / 2, color: borderColor, opacity: 0.5 });
};

const drawGradientRectangle = (page, x, y, width, height, colorTop, colorBottom) => {
  page.drawRectangle({ x, y, width, height, color: colorTop, opacity: 0.9 });
  page.drawRectangle({ x, y: y + height / 2, width, height: height / 2, color: colorBottom, opacity: 0.7 });
};

const drawShadowText = (page, text, x, y, size, font, color, shadowColor, offset = 1) => {
  page.drawText(text, { x: x + offset, y: y - offset, size, font, color: shadowColor, opacity: 0.3 });
  page.drawText(text, { x, y, size, font, color });
};

const drawPattern = (page, x, y, width, height, patternType) => {
  if (patternType === "dots") {
    for (let i = x + 10; i < x + width; i += 20) {
      for (let j = y + 10; j < y + height; j += 20) {
        page.drawCircle({ x: i, y: j, size: 2, color: COLORS.MEDIUM_BROWN, opacity: 0.2 });
      }
    }
  }
};

// Generate OPD Ticket PDF (GET request)
router.get("/generate-ticket/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    console.log("Received request for ticket:", ticketId);

    // Validate ticketId
    if (!ticketId || typeof ticketId !== "string") {
      console.log("❌ Invalid ticketId:", ticketId);
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    // Fetch appointment details from MongoDB
    const appointment = await Appointment.findOne({ ticketId });
    if (!appointment) {
      console.log("❌ Ticket not found in database:", ticketId);
      return res.status(404).json({ error: "Appointment not found" });
    }
    console.log("✅ Appointment found:", appointment);

    const { name, age, phone, address, department, date, slot } = appointment;

    // Ensure all fields are strings
    const safeName = String(name || "N/A");
    const safeAge = String(age || "N/A");
    const safePhone = String(phone || "N/A");
    const safeAddress = String(address || "N/A");
    const safeDepartment = String(department || "N/A");
    const safeSlot = String(slot || "N/A");
    const safeDate = String(date || "N/A"); // Print date as it is

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(ticketId, {
      margin: 2,
      width: 160,
      color: { dark: "#4A2F1F", light: "#F5E8D3" }, // Dark brown and light beige
    });
    console.log("✅ QR Code generated");

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 850]);
    const { width, height } = page.getSize();

    // Embed Fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    console.log("✅ Fonts embedded");

    // Background Image
    const backgroundImagePath = path.join(__dirname, "../assets/kartikey.png");
    if (!fs.existsSync(backgroundImagePath)) {
      console.log("❌ Background image not found at:", backgroundImagePath);
      throw new Error("Background image file not found");
    }
    const backgroundImageBytes = fs.readFileSync(backgroundImagePath);
    const backgroundImage = await pdfDoc.embedPng(backgroundImageBytes);
    page.drawImage(backgroundImage, { x: 0, y: 0, width, height, opacity: 0.95 });
    console.log("✅ Background image added");

    // Background Pattern
    drawPattern(page, 0, 0, width, height, "dots");

    // Header Section
    drawGradientRectangle(page, 0, height - 140, width, 140, COLORS.DARK_BROWN, COLORS.MEDIUM_BEIGE);
    drawDashedLine(page, { x: 20, y: height - 140 }, { x: width - 20, y: height - 140 }, 1.5, COLORS.LIGHT_BROWN, [4, 4], 0.8);

    const headerText = "Kartikey Care OPD Ticket";
    const headerTextWidth = helveticaBold.widthOfTextAtSize(headerText, 40);
    drawShadowText(page, headerText, (width - headerTextWidth) / 2, height - 60, 40, helveticaBold, COLORS.WHITE, COLORS.GRAY); // Adjusted y-position
    const subHeaderText = "Caring for Life";
    const subHeaderTextWidth = helveticaOblique.widthOfTextAtSize(subHeaderText, 22);
    page.drawText(subHeaderText, {
      x: (width - subHeaderTextWidth) / 2,
      y: height - 100,
      size: 20,
      font: helveticaOblique,
      color: COLORS.LIGHT_BEIGE,
    });

    // Main Content Area
    drawRoundedRectangle(page, 40, 100, width - 80, height - 260, 10, {
      borderWidth: 2,
      borderColor: COLORS.MEDIUM_BROWN,
      color: COLORS.WHITE,
      opacity: 0.5,
      borderOpacity: 0.9,
    });

    // Patient Information Section
    let yPosition = height - 180;
    drawShadowText(page, "Patient Information", 60, yPosition, 22, helveticaBold, COLORS.DARK_BROWN, COLORS.GRAY);
    drawDashedLine(page, { x: 60, y: yPosition - 10 }, { x: width - 60, y: yPosition - 10 }, 1, COLORS.SOFT_BROWN, [5, 5], 0.7);

    yPosition -= 40;
    const details = [
      { label: "Patient Name", value: safeName },
      { label: "Age", value: safeAge },
      { label: "Phone Number", value: safePhone },
      { label: "Address", value: safeAddress },
      { label: "Department", value: safeDepartment },
      { label: "Date", value: safeDate }, // Print date as it is
      { label: "Time Slot", value: safeSlot },
      { label: "Ticket ID", value: ticketId },
    ];
    details.forEach((detail, index) => {
      page.drawText(`${detail.label}:`, {
        x: 60,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: COLORS.MEDIUM_BROWN,
      });
      page.drawText(detail.value, {
        x: 180,
        y: yPosition,
        size: 14,
        font: helvetica,
        color: rgb(0.2, 0.12, 0.08), // Darker brown for better contrast
      });
      if (index === details.length - 1) {
        drawRoundedRectangle(page, 170, yPosition - 4, helvetica.widthOfTextAtSize(detail.value, 14) + 20, 22, 5, {
          borderWidth: 1,
          borderColor: COLORS.MEDIUM_BROWN,
          color: COLORS.MEDIUM_BEIGE,
          opacity: 0.6,
          borderOpacity: 0.9,
        });
      }
      yPosition -= 28;
      if (index === 3) yPosition -= 20; // Extra space after Address
    });

    // QR Code Section
    const qrImage = await pdfDoc.embedPng(qrCodeDataUrl);
    drawRoundedRectangle(page, 380, height - 300, 180, 180, 8, {
      borderWidth: 2,
      borderColor: COLORS.MEDIUM_BROWN,
      color: COLORS.WHITE,
      opacity: 0.1,
      borderOpacity: 0.9,
    });
    page.drawImage(qrImage, {
      x: 390,
      y: height - 290,
      width: 160,
      height: 160,
    });
    drawShadowText(page, "Scan to Verify", 425, height - 320, 14, helveticaOblique, COLORS.SOFT_BROWN, COLORS.GRAY);

    // Horizontal Divider (since vertical line is removed)
    drawDashedLine(page, { x: 60, y: yPosition - 20 }, { x: width - 60, y: yPosition - 20 }, 1, COLORS.LIGHT_BROWN, [6, 6], 0.7);

    // Visit Guidelines Section
    const guidelines = [
      "Please arrive 15 minutes prior to your scheduled slot.",
      "Adhere to social distancing and follow all hospital safety protocols.",
      "For assistance, contact our reception desk or call the emergency number.",
      "Emergency Contact: +91 7388109688",
      "Thank you for choosing Kartikey Care for your healthcare needs!",
    ];

    yPosition -= 40;
    drawShadowText(page, "Visit Guidelines", 60, yPosition, 20, helveticaBold, COLORS.DARK_BROWN, COLORS.GRAY);
    drawDashedLine(page, { x: 60, y: yPosition - 10 }, { x: width - 60, y: yPosition - 10 }, 1, COLORS.SOFT_BROWN, [5, 5], 0.7);

    yPosition -= 40;
    guidelines.forEach((text, index) => {
      page.drawText(`${index + 1}. ${text}`, {
        x: 60,
        y: yPosition,
        size: 14, // Increased for accessibility
        font: index === 3 ? helveticaBold : helvetica, // Bold emergency contact
        color: COLORS.SOFT_BROWN,
      });
      yPosition -= 24;
    });

    // Footer Section
    drawGradientRectangle(page, 0, 0, width, 140, COLORS.BEIGE, COLORS.MEDIUM_BEIGE);
    drawDashedLine(page, { x: 20, y: 140 }, { x: width - 20, y: 140 }, 1.5, COLORS.LIGHT_BROWN, [4, 4], 0.8);

    page.drawText("Kartikey Care Hospital", {
      x: (width - helveticaBold.widthOfTextAtSize("Kartikey Care Hospital", 22)) / 2,
      y: 110,
      size: 22,
      font: helveticaBold,
      color: COLORS.DARK_BROWN,
    });
    page.drawText("Taramandal, Gorakhpur, UP 273017", {
      x: (width - helvetica.widthOfTextAtSize("123 Health Street, Gorakhpur, UP 273001", 12)) / 2,
      y: 90,
      size: 12,
      font: helvetica,
      color: COLORS.MEDIUM_BROWN,
    });
    const contactText = "Contact: +91 7388109688 | kartikeyy.pandeyy@gmail.com | kartikeycare.vercel.app";
    page.drawText(contactText, {
      x: (width - helvetica.widthOfTextAtSize(contactText, 12)) / 2,
      y: 73,
      size: 12,
      font: helvetica,
      color: COLORS.MEDIUM_BROWN,
    });
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: (width - helveticaOblique.widthOfTextAtSize(`Generated: ${new Date().toLocaleString()}`, 12)) / 2,
      y: 50,
      size: 12,
      font: helveticaOblique,
      color: COLORS.LIGHT_BROWN,
    });
    page.drawText("National Emergency: 108 | Ticket Valid till slot ends", {
      x: (width - helvetica.widthOfTextAtSize("National Emergency: 108 | Ticket Valid till slot ends", 10)) / 2,
      y: 30,
      size: 10,
      font: helvetica,
      color: COLORS.SOFT_BROWN,
    });

    // Clickable Links
    const websiteText = "kartikeycare.vercel.app";
    const websiteTextWidth = helvetica.widthOfTextAtSize(websiteText, 12);
    const websiteLinkX = (width - helvetica.widthOfTextAtSize(contactText, 12)) / 2 + 220;
    const websiteAnnotation = pdfDoc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [websiteLinkX, 70, websiteLinkX + websiteTextWidth, 82],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: pdfDoc.context.obj("https://kartikeycare.vercel.app/"),
      },
    });
    page.node.addAnnot(websiteAnnotation);

    const emailText = "kartikeyy.pandeyy@gmail.com";
    const emailTextWidth = helvetica.widthOfTextAtSize(emailText, 12);
    const emailLinkX = (width - helvetica.widthOfTextAtSize(contactText, 12)) / 2 + 110;
    const emailAnnotation = pdfDoc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [emailLinkX, 70, emailLinkX + emailTextWidth, 82],
      Border: [0, 0, 0],
      A: {
        Type: "Action",
        S: "URI",
        URI: pdfDoc.context.obj("mailto:kartikeyy.pandeyy@gmail.com"),
      },
    });
    page.node.addAnnot(emailAnnotation);
    console.log("✅ Link annotations added");

    // Decorative Elements
    drawDashedLine(page, { x: 20, y: height - 20 }, { x: width - 20, y: height - 20 }, 1, COLORS.LIGHT_BROWN, [3, 3], 0.6);
    drawDashedLine(page, { x: 20, y: 10 }, { x: width - 20, y: 10 }, 1, COLORS.LIGHT_BROWN, [3, 3], 0.6);
    page.drawCircle({ x: 20, y: height - 20, size: 5, color: COLORS.SOFT_BROWN, opacity: 0.5 });
    page.drawCircle({ x: width - 20, y: height - 20, size: 5, color: COLORS.SOFT_BROWN, opacity: 0.5 });
    page.drawCircle({ x: 20, y: 20, size: 5, color: COLORS.SOFT_BROWN, opacity: 0.5 });
    page.drawCircle({ x: width - 20, y: 20, size: 5, color: COLORS.SOFT_BROWN, opacity: 0.5 });

    // Powered by xAI
    page.drawText("Kartikey Pandey", {
      x: width - 100,
      y: 20,
      size: 10,
      font: helveticaOblique,
      color: COLORS.GRAY,
      opacity: 0.5,
    });

    // PDF Metadata
    pdfDoc.setTitle(`OPD Ticket - ${ticketId}`);
    pdfDoc.setAuthor("Kartikey Care Hospital");
    pdfDoc.setSubject("Appointment Confirmation");
    pdfDoc.setKeywords(["OPD", "Ticket", "Kartikey Care", ticketId, "Healthcare", "Appointment"]);
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setProducer("Kartikey Care System v3.0");

    // Save and Send PDF
    const pdfBytes = await pdfDoc.save();
    console.log("✅ PDF generated successfully");
    res.setHeader("Content-Disposition", `attachment; filename=OPD_Ticket_${ticketId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("❌ Detailed error generating OPD Ticket PDF:", error.message, error.stack);
    res.status(500).json({ error: "Failed to generate OPD Ticket", details: error.message });
  }
});

module.exports = router;