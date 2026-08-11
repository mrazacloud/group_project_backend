const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const EventHistory = require('../models/EventHistory');

// POST /api/events/:id/rsvp — authenticated, RSVP to an event
exports.createRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check if user already has an RSVP
    const existing = await RSVP.findOne({ event: event._id, user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already RSVP\'d to this event.' });
    }

    // Check capacity
    const attendingCount = await RSVP.countDocuments({
      event: event._id,
      status: 'attending'
    });

    const status = attendingCount >= event.capacity ? 'waitlisted' : 'attending';

    const rsvp = await RSVP.create({
      event: event._id,
      user: req.user.id,
      status
    });

    await EventHistory.create({
      event: event._id,
      username: req.user.username,
      action: `RSVP'd — status: ${status}`
    });

    res.status(201).json(rsvp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/events/:id/rsvp — authenticated, cancel own RSVP
exports.cancelRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({ event: req.params.id, user: req.user.id });
    if (!rsvp) {
      return res.status(404).json({ message: 'RSVP not found.' });
    }

    rsvp.status = 'cancelled';
    await rsvp.save();

    await EventHistory.create({
      event: req.params.id,
      username: req.user.username,
      action: 'Cancelled RSVP'
    });

    res.json(rsvp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/events/:id/rsvps — list RSVPs for an event
exports.listRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.id })
      .populate('user', 'username email');
    res.json(rsvps);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
