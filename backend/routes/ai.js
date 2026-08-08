const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Meeting } = require('../models');
const GeminiService = require('../services/geminiService');

// @route   GET /api/ai/insights
router.get('/insights', protect, async (req, res) => {
  try {
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id },
    });
    
    const formattedMeetings = meetings.map(m => ({
      title: m.title,
      duration: (new Date(m.endTime) - new Date(m.startTime)) / (1000 * 60),
      attendeeCount: m.attendeeCount,
      roi: parseFloat(m.roi),
    }));
    
    const totalCost = meetings.reduce((sum, m) => sum + parseFloat(m.cost), 0);
    const totalROI = meetings.reduce((sum, m) => sum + parseFloat(m.roi), 0);
    const avgROI = meetings.length > 0 ? totalROI / meetings.length : 0;
    const avgDuration = meetings.length > 0 
      ? meetings.reduce((sum, m) => sum + (new Date(m.endTime) - new Date(m.startTime)) / (1000 * 60), 0) / meetings.length 
      : 0;
    const avgAttendees = meetings.length > 0 
      ? meetings.reduce((sum, m) => sum + m.attendeeCount, 0) / meetings.length 
      : 0;
    
    const stats = {
      totalMeetings: meetings.length,
      totalCost,
      avgROI,
      avgDuration,
      avgAttendees,
    };
    
    // Get Gemini-powered insights
    const insights = await GeminiService.getAIInsights(formattedMeetings, stats);
    
    res.json({
      success: true,
      insights,
      stats,
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id },
    });
    
    const totalCost = meetings.reduce((sum, m) => sum + parseFloat(m.cost), 0);
    const totalROI = meetings.reduce((sum, m) => sum + parseFloat(m.roi), 0);
    const avgROI = meetings.length > 0 ? totalROI / meetings.length : 0;
    
    const response = await GeminiService.chat(message, {
      meetingCount: meetings.length,
      totalCost,
      avgROI,
    });
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/predict-roi
router.post('/predict-roi', protect, async (req, res) => {
  try {
    const { title, duration, attendeeCount, timeOfDay } = req.body;
    
    // Simple ROI prediction without API call
    let predictedROI = 0;
    if (duration >= 30 && duration <= 60) predictedROI += 25;
    if (duration > 90) predictedROI -= 30;
    if (attendeeCount >= 2 && attendeeCount <= 8) predictedROI += 20;
    if (attendeeCount > 15) predictedROI -= 40;
    if (timeOfDay >= 10 && timeOfDay <= 14) predictedROI += 15;
    
    let recommendation = '';
    if (predictedROI > 30) recommendation = 'This meeting has excellent potential!';
    else if (predictedROI > 0) recommendation = 'This meeting should be productive.';
    else recommendation = 'Consider reducing duration or attendees for better ROI.';
    
    res.json({
      success: true,
      predictedROI,
      recommendation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;