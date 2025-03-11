const crypto = require("crypto");
const QRCode = require("qrcode");

// ✅ Function to generate a unique Ticket ID
const generateTicketId = () => {
    const now = new Date();
    
    // Format the date and time parts
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');  // Months are zero-indexed
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Generate ticket ID in the format: KCddmmyyyyhhmmss
    const ticketId = `KC${day}${month}${year}${hours}${minutes}${seconds}`;
    
    return ticketId;
};

// ✅ Function to generate a QR Code as SVG
const generateQR = async (ticketId) => {
    try {
        return await QRCode.toDataURL(ticketId);
    } catch (error) {
        console.error("Error generating QR code:", error);
        return null;
    }
};

module.exports = { generateTicketId, generateQR };
