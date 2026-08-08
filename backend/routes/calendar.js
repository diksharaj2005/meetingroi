const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { protect } = require('../middleware/auth');
const { Meeting, GoogleToken } = require('../models');

// Google OAuth2 client
const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
  );
};

// @route   GET /api/calendar/auth-url
router.get('/auth-url', protect, async (req, res) => {
  try {
    console.log('Generating auth URL for user:', req.user.id);
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      state: req.user.id,
      prompt: 'consent',
    });
    res.json({ success: true, url });
  } catch (error) {
    console.error('Auth URL error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/google/callback
router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  console.log('Google callback received - Code:', code ? 'Yes' : 'No', 'State:', state);
  
  if (error) {
    console.error('Google auth error:', error);
    return res.redirect('http://localhost:5173/calendar?sync=failed');
  }
  
  if (!code) {
    console.error('No code received');
    return res.redirect('http://localhost:5173/calendar?sync=failed');
  }
  
  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Google tokens received');
    
    // Store tokens in database
    await GoogleToken.upsert({
      userId: state,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date),
    });
    console.log('✅ Tokens stored for user:', state);
    
    res.redirect('http://localhost:5173/calendar?sync=success');
  } catch (error) {
    console.error('Token exchange error:', error);
    res.redirect('http://localhost:5173/calendar?sync=failed');
  }
});

// @route   POST /api/calendar/sync
router.post('/sync', protect, async (req, res) => {
  try {
    console.log('📅 Sync started for user:', req.user.id);
    
    // Get user's Google tokens
    const googleToken = await GoogleToken.findOne({
      where: { userId: req.user.id }
    });
    
    if (!googleToken) {
      console.log('No Google token found for user');
      return res.json({ 
        success: true, 
        synced: 0, 
        message: 'Google Calendar not connected. Please connect first.',
        meetings: []
      });
    }
    
    console.log('✅ Token found, setting up OAuth client...');
    
    // Set up OAuth client with stored tokens
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: googleToken.accessToken,
      refresh_token: googleToken.refreshToken,
    });
    
    // Refresh token if expired
    if (new Date() > googleToken.expiryDate) {
      console.log('Token expired, refreshing...');
      const { credentials } = await oauth2Client.refreshToken(googleToken.refreshToken);
      await googleToken.update({
        accessToken: credentials.access_token,
        expiryDate: new Date(credentials.expiry_date),
      });
      oauth2Client.setCredentials(credentials);
      console.log('✅ Token refreshed');
    }
    
    // Fetch events from Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 6); // Last 6 months
    
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 12); // Next 12 months
    
    console.log('Fetching events from:', timeMin.toISOString());
    console.log('To:', timeMax.toISOString());
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    console.log(`📅 Found ${events.length} events from Google Calendar`);
    
    const syncedMeetings = [];
    let skippedCount = 0;
    
    for (const event of events) {
      // Skip if no start time (all-day events)
      if (!event.start?.dateTime) {
        console.log('Skipping all-day event:', event.summary);
        skippedCount++;
        continue;
      }
      
      // Check if meeting already exists
      const existing = await Meeting.findOne({
        where: {
          userId: req.user.id,
          calendarEventId: event.id,
        },
      });
      
      if (!existing) {
        console.log('Creating meeting for:', event.summary);
        
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const duration = (endTime - startTime) / (1000 * 60);
        const attendeeCount = event.attendees?.length || 0;
        const cost = (duration / 60) * attendeeCount * 50; // $50/hour average
        
        const meeting = await Meeting.create({
          userId: req.user.id,
          title: event.summary || 'Untitled Meeting',
          description: event.description || '',
          startTime: startTime,
          endTime: endTime,
          attendees: event.attendees?.map(a => ({ name: a.displayName || a.email, email: a.email })) || [],
          attendeeCount: attendeeCount,
          cost: cost,
          roi: 0,
          priority: 'medium',
          status: 'scheduled',
          calendarEventId: event.id,
          calendarSource: 'google',
        });
        syncedMeetings.push(meeting);
      } else {
        console.log('Meeting already exists:', event.summary);
      }
    }
    
    console.log(`✅ Sync complete! Synced ${syncedMeetings.length} new meetings (skipped ${skippedCount} all-day events)`);
    
    res.json({
      success: true,
      synced: syncedMeetings.length,
      total: events.length,
      skipped: skippedCount,
      message: `Successfully synced ${syncedMeetings.length} meetings from Google Calendar`,
      meetings: syncedMeetings,
    });
    
  } catch (error) {
    console.error('Sync error details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message, 
      synced: 0,
      error: error.toString()
    });
  }
});

module.exports = router;