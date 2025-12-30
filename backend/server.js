require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

const app = express();

// Connexion DB
connectDB();

// =====================
// MIDDLEWARES
// =====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// STATIC FILES
// =====================
app.use('/uploads', express.static('src/uploads'));

// =====================
// TEST ROUTE
// =====================
app.get('/', (req, res) => {
  res.json({
    message: '🍎 API Food Waste - Lutte contre le gaspillage alimentaire',
    status: 'running'
  });
});

// =====================
// ROUTES API
// =====================
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/donations', require('./src/routes/donationRoutes'));
app.use('/api/reservations', require('./src/routes/reservationRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// =====================
// 404
// =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// =====================
// ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
});
