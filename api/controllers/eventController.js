const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const EventHistory = require('../models/EventHistory');

// GET /api/events — public, list all upcoming events
exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'username email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/events/:id — public, get single event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/events — authenticated, create event
exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date, location, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      organizer: req.user.id
    });

    // Log creation in history
    await EventHistory.create({
      event: event._id,
      username: req.user.username,
      action: 'Event created'
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/events/:id — authenticated, edit own event
exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only the organizer can edit
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this event.' });
    }

    const { title, description, date, location, capacity } = req.body;
    const changes = [];

    if (title && title !== event.title) changes.push(`Title changed to "${title}"`);
    if (description && description !== event.description) changes.push('Description updated');
    if (date && new Date(date).getTime() !== event.date.getTime()) changes.push(`Date changed to ${date}`);
    if (location && location !== event.location) changes.push(`Location changed to "${location}"`);
    if (capacity && capacity !== event.capacity) changes.push(`Capacity changed to ${capacity}`);

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.capacity = capacity || event.capacity;

    await event.save();

    // Log changes in history
    if (changes.length > 0) {
      await EventHistory.create({
        event: event._id,
        username: req.user.username,
        action: changes.join('; ')
      });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/events/:id/status — authenticated, change status (no delete allowed)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to change this event status.' });
    }

    const oldStatus = event.status;
    event.status = status;
    await event.save();

    // Log status change in history
    await EventHistory.create({
      event: event._id,
      username: req.user.username,
      action: `Status changed from "${oldStatus}" to "${status}"`
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/events/:id/history — authenticated, view event history
exports.getHistory = async (req, res) => {
  try {
    const history = await EventHistory.find({ event: req.params.id })
      .sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
