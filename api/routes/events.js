const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const eventController = require('../controllers/eventController');
const rsvpController = require('../controllers/rsvpController');

const router = express.Router();

// GET /api/events — public
router.get('/', eventController.listEvents);

// GET /api/events/:id — public
router.get('/:id', eventController.getEvent);

// POST /api/events — authenticated
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  validate
], eventController.createEvent);

// PUT /api/events/:id — authenticated, edit own event
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('location').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 }),
  validate
], eventController.updateEvent);

// PUT /api/events/:id/status — authenticated, change status
router.put('/:id/status', auth, [
  body('status').isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  validate
], eventController.updateStatus);

// DELETE /api/events/:id — authenticated, delete own event
router.delete('/:id', auth, eventController.deleteEvent);

// GET /api/events/my-rsvps — authenticated, list events user RSVPed to
router.get('/my-rsvps', auth, rsvpController.myRSVPs);

// GET /api/events/:id/history — authenticated
router.get('/:id/history', auth, eventController.getHistory);

// RSVP routes
// POST /api/events/:id/rsvp — authenticated
router.post('/:id/rsvp', auth, rsvpController.createRSVP);

// PUT /api/events/:id/rsvp — authenticated, cancel
router.put('/:id/rsvp', auth, rsvpController.cancelRSVP);

// GET /api/events/:id/rsvps — list RSVPs
router.get('/:id/rsvps', rsvpController.listRSVPs);

module.exports = router;
