const express = require('express');
const router = express.Router();
const { Meeting } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/meetings - Get all meetings
router.get('/', protect, async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id },
      order: [['startTime', 'DESC']]
    });
    res.json({ success: true, meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/meetings - Create a meeting
router.post('/', protect, async (req, res) => {
  try {
    const { title, startTime, endTime, attendees, priority } = req.body;
    
    const meeting = await Meeting.create({
      userId: req.user.id,
      title,
      startTime,
      endTime,
      attendees: attendees || [],
      attendeeCount: attendees?.length || 0,
      priority: priority || 'medium',
      status: 'scheduled'
    });
    
    res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/meetings/:id - Get single meeting
router.get('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/meetings/:id - Update meeting
router.put('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    await meeting.update(req.body);
    res.json({ success: true, meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/meetings/:id - Delete meeting
router.delete('/:id', protect, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    await meeting.destroy();
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// GET /api/meetings/stats/summary - Get meeting statistics
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id }
    });

    const totalCost = meetings.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    const avgROI = meetings.length > 0 
      ? meetings.reduce((sum, m) => sum + (parseFloat(m.roi) || 0), 0) / meetings.length 
      : 0;
    const upcoming = meetings.filter(m => m.status === 'scheduled').length;
    const completed = meetings.filter(m => m.status === 'completed').length;

    res.json({
      success: true,
      stats: {
        totalCost,
        avgROI,
        totalMeetings: meetings.length,
        upcoming,
        completed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
