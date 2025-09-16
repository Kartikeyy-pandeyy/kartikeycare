const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const appointmentRoutes = require("./routes/appointmentroutes");
const opdRoutes = require("./routes/opdroutes"); // OPD Ticket Routes

dotenv.config();
connectDB();

const app = express();

// ✅ Allow CORS from anywhere
app.use(
    cors({
      origin: "*", // Allow all origins (or specify frontend URL for security)
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: "Content-Type",
    })
  );
  

app.use(express.json());

// ✅ Register Routes
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
app.get('/api/ping', (req, res) => {
  res.status(200).send('OK');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} at ${new Date().toLocaleString()}`));
