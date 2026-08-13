/**
 * EventHub API — COMP229 Group Project
 * Express app entry point (Vercel serverless compatible)
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'EventHub API is running', version: '1.0.0' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Export for Vercel serverless — wrap as handler function
module.exports = (req, res) => app(req, res);
