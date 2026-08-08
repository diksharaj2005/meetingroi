const express = require('express');
const router = express.Router();
const { User, Meeting } = require('../models');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, company } = req.body;
    await User.update({ name, company }, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/team
router.get('/team', protect, async (req, res) => {
  try {
    // Get current user's meetings
    const meetings = await Meeting.findAll({
      where: { userId: req.user.id }
    });
    
    const totalMeetings = meetings.length;
    const totalCost = meetings.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    const avgROI = totalMeetings > 0 
      ? meetings.reduce((sum, m) => sum + (parseFloat(m.roi) || 0), 0) / totalMeetings 
      : 0;
    
    // ✅ Calculate efficiency - DEFAULT TO NULL, NOT 50%
    let efficiency = null;
    let efficiencyLabel = 'No meetings yet';
    
    if (totalMeetings > 0) {
      // Base efficiency: 50% baseline
      efficiency = 50;
      
      // ROI impact
      if (avgROI > 20) efficiency += 20;
      else if (avgROI > 10) efficiency += 10;
      else if (avgROI > 0) efficiency += 5;
      else if (avgROI > -10) efficiency -= 10;
      else if (avgROI > -20) efficiency -= 20;
      else efficiency -= 30;
      
      // Meeting count impact
      if (totalMeetings >= 3 && totalMeetings <= 10) efficiency += 10;
      else if (totalMeetings < 3) efficiency -= 5;
      else if (totalMeetings > 15) efficiency -= 10;
      else if (totalMeetings > 20) efficiency -= 15;
      
      // Cost per meeting impact
      const avgCostPerMeeting = totalCost / totalMeetings;
      if (avgCostPerMeeting < 200) efficiency += 15;
      else if (avgCostPerMeeting < 500) efficiency += 10;
      else if (avgCostPerMeeting < 1000) efficiency += 5;
      else if (avgCostPerMeeting > 3000) efficiency -= 15;
      else if (avgCostPerMeeting > 2000) efficiency -= 10;
      else if (avgCostPerMeeting > 1500) efficiency -= 5;
      
      // Clamp between 0-100
      efficiency = Math.min(100, Math.max(0, efficiency));
      
      // Set label based on score
      if (efficiency >= 80) efficiencyLabel = '🌟 Excellent';
      else if (efficiency >= 65) efficiencyLabel = '✅ Good';
      else if (efficiency >= 45) efficiencyLabel = '📊 Average';
      else efficiencyLabel = '⚠️ Needs Improvement';
    }
    
    // Create team member object
    const teamMembers = [{
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: 'Team Lead',
      department: 'Leadership',
      status: 'active',
      meetingsCount: totalMeetings,
      totalCost: totalCost,
      avgROI: avgROI,
      efficiency: efficiency,  // ✅ This is NULL when no meetings
      efficiencyLabel: efficiencyLabel,
      avatar: req.user.name?.charAt(0) || 'U',
      joinedAt: new Date(),
    }];
    
    // Calculate team stats
    const membersWithEfficiency = teamMembers.filter(m => m.efficiency !== null);
    const avgEfficiency = membersWithEfficiency.length > 0 
      ? membersWithEfficiency.reduce((sum, m) => sum + m.efficiency, 0) / membersWithEfficiency.length 
      : 0;
    
    const teamStats = {
      totalMembers: teamMembers.length,
      totalMeetings: teamMembers.reduce((sum, m) => sum + (m.meetingsCount || 0), 0),
      totalCost: teamMembers.reduce((sum, m) => sum + (m.totalCost || 0), 0),
      avgEfficiency: avgEfficiency,
      mostEfficient: teamMembers[0],
      needsImprovement: teamMembers[0],
      membersWithData: membersWithEfficiency.length,
    };
    
    res.json({
      success: true,
      team: teamMembers,
      stats: teamStats,
      currentUser: req.user
    });
  } catch (error) {
    console.error('Team fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;