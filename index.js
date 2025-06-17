const express = require('express');
const cors = require('cors'); 
const app = express();
require('dotenv').config();
const db = require('./models');
const authRoutes = require('./routes/auth');
const admin = require('./routes/loginAdmin');
const appointment = require('./routes/appointment');
const path = require("path");

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(express.json());

// ✅ If using URL-encoded data (like form data)
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointment);
app.use('/api', admin);

db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server started on port ${process.env.PORT || 5000}`)
  );
});
