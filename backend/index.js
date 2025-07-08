require("dotenv").config(); // .env dosyasını okuyabilmek için

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Orta katmanlar
app.use(cors());
app.use(express.json());

// Rotalar
app.use("/api/tasks", taskRoutes);

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas bağlantısı başarılı");
  })
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// Test endpoint
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
