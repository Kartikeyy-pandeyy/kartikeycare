// server.js (Updated)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const appointmentRoutes = require("./routes/appointmentroutes");
const opdRoutes = require("./routes/opdroutes"); // OPD Ticket Routes

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: ["https://kartikeycare.vercel.app/", "http://localhost:3000"], // Add your frontend URL(s)
    methods: ["GET", "POST", "PUT", "DELETE"], // Limit HTTP methods if needed
    allowedHeaders: ["Content-Type", "Authorization"], // Restrict headers if needed
}));
 // ✅ Secure CORS Policy (Adjust if needed)
app.use(express.json());

app.use("/api/appointments", appointmentRoutes);
app.use("/api/opd", opdRoutes);

// ✅ Handle 404 Routes
app.use((req, res) => {
    res.status(404).json({ error: "API route not found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} at ${new Date().toLocaleString()}`));
