const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], authController.register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], authController.login);

// GET /api/auth/profile
router.get('/profile', auth, authController.getProfile);

// PUT /api/auth/profile
router.put('/profile', auth, [
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  validate
], authController.updateProfile);

module.exports = router;
