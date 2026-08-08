const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  static getApiKey() {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  }

  static getGeminiModel() {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  static createGeminiClient() {
    const apiKey = this.getApiKey();
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  static extractText(response) {
    if (!response) return '';

    if (typeof response.text === 'string' && response.text.trim()) {
      return response.text.trim();
    }

    if (Array.isArray(response?.candidates)) {
      const text = response.candidates
        .map(candidate => {
          const parts = candidate?.content?.parts || [];
          return parts.map(part => part?.text || '').join('');
        })
        .join('\n')
        .trim();

      if (text) return text;
    }

    return '';
  }

  static async generateFromGemini(prompt, fallbackValue) {
    const client = this.createGeminiClient();
    if (!client) return fallbackValue;

    try {
      const response = await client.models.generateContent({
        model: this.getGeminiModel(),
        contents: prompt,
      });

      const text = this.extractText(response);
      return text || fallbackValue;
    } catch (error) {
      console.error('Gemini API error:', error?.message || error);
      return fallbackValue;
    }
  }

  // ============================================
  // CHAT ASSISTANT
  // ============================================
  static async chat(message, context) {
    const fallback = this.getFallbackChatResponse(message, context);
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallback;
    }

    const prompt = `
      You are MeetingROI AI, a friendly meeting optimization expert.
      
      User has ${context.meetingCount || 0} meetings.
      Total cost: $${context.totalCost?.toLocaleString() || 0}.
      Average ROI: ${context.avgROI || 0}%.
      
      User question: ${message}
      
      Give a helpful, concise response (2-3 sentences). Be friendly and actionable.
    `;

    return this.generateFromGemini(prompt, fallback);
  }

  // ============================================
  // AI INSIGHTS FOR DASHBOARD
  // ============================================
  static async getAIInsights(meetings, stats) {
    const fallback = this.getFallbackInsights(meetings, stats);
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallback;
    }

    const prompt = `
      Meeting Data:
      - Total meetings: ${stats.totalMeetings}
      - Average duration: ${Math.round(stats.avgDuration)} minutes
      - Average attendees: ${stats.avgAttendees}
      - Total cost: $${stats.totalCost.toLocaleString()}
      - Average ROI: ${stats.avgROI}%
      
      Provide 3 short actionable insights to improve meeting ROI.
      Return as JSON array with objects having "type" (quick_win, pattern, or positive) and "message" fields.
      Example: [{"type":"quick_win","message":"Keep meetings under 45 minutes"},{"type":"pattern","message":"Limit attendees to 8"},{"type":"positive","message":"Good progress!"}]
    `;

    const text = await this.generateFromGemini(prompt, '');

    try {
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed;
        }
      }
    } catch (e) {}

    return fallback;
  }

  // ============================================
  // MEETING SUMMARY GENERATOR
  // ============================================
  static async generateMeetingSummary(meeting) {
    const fallback = this.getFallbackMeetingSummary(meeting);
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallback;
    }

    const prompt = `
      Create a 2-3 sentence meeting summary for:
      Title: "${meeting.title}"
      Attendees: ${meeting.attendeeCount || 0} people
      Duration: ${Math.round(meeting.duration || 0)} minutes
      Description: ${meeting.description || 'No description provided'}
      
      Format: Brief summary of what was discussed, key outcomes, and next steps.
    `;

    return this.generateFromGemini(prompt, fallback);
  }

  static getFallbackMeetingSummary(meeting) {
    return `Meeting "${meeting.title}" had ${meeting.attendeeCount || 0} attendees and lasted ${Math.round(meeting.duration || 0)} minutes. Focus on clear outcomes and action items for better results.`;
  }

  // ============================================
  // ACTION ITEM EXTRACTION
  // ============================================
  static async extractActionItems(meeting) {
    const fallback = this.getFallbackActionItems(meeting);
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallback;
    }

    const prompt = `
      Based on this meeting:
      Title: "${meeting.title}"
      Description: ${meeting.description || 'No description'}
      
      Extract 2-3 action items as a JSON array.
      Example: ["Schedule follow-up meeting", "Send proposal to client", "Update project timeline"]
      
      Return only the JSON array, nothing else.
    `;

    const text = await this.generateFromGemini(prompt, '');

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

    return fallback;
  }

  static getFallbackActionItems(meeting) {
    return [
      `Review meeting outcomes from "${meeting.title}"`,
      `Schedule follow-up discussion`,
      `Share meeting notes with stakeholders`
    ];
  }

  // ============================================
  // ROI PREDICTION FOR NEW MEETINGS
  // ============================================
  static async predictROI(meetingData) {
    const { title, duration, attendeeCount, timeOfDay, dayOfWeek } = meetingData;
    
    let predictedROI = 0;
    if (duration >= 30 && duration <= 60) predictedROI += 25;
    if (duration > 90) predictedROI -= 30;
    if (attendeeCount >= 2 && attendeeCount <= 8) predictedROI += 20;
    if (attendeeCount > 15) predictedROI -= 40;
    if (timeOfDay >= 10 && timeOfDay <= 14) predictedROI += 15;
    if (timeOfDay < 9 || timeOfDay > 17) predictedROI -= 25;
    if (dayOfWeek >= 2 && dayOfWeek <= 4) predictedROI += 10;
    
    let recommendation = '';
    if (predictedROI > 30) recommendation = '🎉 This meeting has excellent potential!';
    else if (predictedROI > 0) recommendation = '📈 This meeting should be productive.';
    else if (predictedROI > -30) recommendation = '⚠️ Consider reducing duration or attendees for better ROI.';
    else recommendation = '🚫 This meeting may not be valuable. Consider async alternatives.';
    
    return {
      predictedROI,
      recommendation,
      suggestions: this.getOptimizationSuggestions(meetingData)
    };
  }

  static getOptimizationSuggestions(meetingData) {
    const suggestions = [];
    const { duration, attendeeCount, timeOfDay } = meetingData;
    
    if (duration > 60) {
      suggestions.push('Shorten meeting to 45 minutes for 30% better engagement.');
    }
    if (attendeeCount > 10) {
      suggestions.push('Reduce attendees to 5-8 key people for faster decisions.');
    }
    if (timeOfDay < 9 || timeOfDay > 16) {
      suggestions.push('Schedule between 10 AM - 2 PM for optimal energy.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Your meeting parameters look optimal! Focus on clear agenda.');
    }
    
    return suggestions;
  }

  // ============================================
  // SMART SCHEDULING RECOMMENDATIONS
  // ============================================
  static async getSmartSchedule(meetings) {
    const fallback = this.getFallbackSchedule(meetings);
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallback;
    }

    const meetingTimes = meetings.map(m => ({
      day: new Date(m.startTime).getDay(),
      hour: new Date(m.startTime).getHours(),
      duration: Math.round((new Date(m.endTime) - new Date(m.startTime)) / (1000 * 60)),
    }));

    const prompt = `
      Meeting times data: ${JSON.stringify(meetingTimes)}
      
      Recommend 3 best times for future meetings based on this data.
      Return as JSON array: ["10:00 AM Tuesday", "2:00 PM Thursday", "11:00 AM Wednesday"]
    `;

    const text = await this.generateFromGemini(prompt, '');

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

    return fallback;
  }

  static getFallbackSchedule(meetings) {
    return [
      '📅 Tuesday 10:00 AM - Peak productivity time',
      '📅 Thursday 2:00 PM - High energy post-lunch',
      '📅 Wednesday 11:00 AM - Best for decision making'
    ];
  }

  // ============================================
  // SENTIMENT ANALYSIS
  // ============================================
  static async analyzeSentiment(text) {
    const apiKey = this.getApiKey();
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return { sentiment: 'neutral', score: 50 };
    }

    const prompt = `
      Analyze the sentiment of this text: "${text}"
      Return as JSON: {"sentiment": "positive/negative/neutral", "score": 0-100}
    `;

    const raw = await this.generateFromGemini(prompt, '{"sentiment":"neutral","score":50}');

    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      return { sentiment: 'neutral', score: 50 };
    }
  }

  // ============================================
  // FALLBACK RESPONSES
  // ============================================
  static getFallbackInsights(meetings, stats) {
    const insights = [];
    
    if (stats.avgDuration > 60) {
      insights.push({
        type: 'quick_win',
        message: `Your average meeting length is ${Math.round(stats.avgDuration)} minutes. Shortening to 45 minutes could improve engagement by 30%.`
      });
    } else if (stats.avgDuration > 0) {
      insights.push({
        type: 'quick_win',
        message: `Your meeting duration (${Math.round(stats.avgDuration)} min) is optimal! Focus on clear agendas to maximize ROI.`
      });
    } else {
      insights.push({
        type: 'quick_win',
        message: `Keep meetings under 45 minutes to maintain high engagement and better ROI.`
      });
    }
    
    if (stats.avgAttendees > 10) {
      insights.push({
        type: 'pattern',
        message: `You average ${Math.round(stats.avgAttendees)} attendees per meeting. Reducing to 5-8 key people could increase ROI by 40%.`
      });
    } else if (stats.avgAttendees > 0) {
      insights.push({
        type: 'pattern',
        message: `Your attendee count (${Math.round(stats.avgAttendees)} people) is in the sweet spot! Keep inviting only essential participants.`
      });
    } else {
      insights.push({
        type: 'pattern',
        message: `Limit attendees to 5-8 key people for more productive discussions.`
      });
    }
    
    if (stats.totalMeetings > 0) {
      insights.push({
        type: 'positive',
        message: `You're tracking ${stats.totalMeetings} meetings. Every tracked meeting helps optimize team efficiency!`
      });
    } else {
      insights.push({
        type: 'positive',
        message: `Start tracking your meetings to get personalized ROI insights and optimization tips!`
      });
    }
    
    return insights;
  }

  static getFallbackChatResponse(message, context) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('roi')) {
      const roi = context.avgROI || 0;
      const count = context.meetingCount || 0;
      if (count === 0) return `📊 No meetings yet. Add your first meeting to start tracking ROI!`;
      if (roi === 0) return `📊 Based on your ${count} meetings, average ROI is 0%. Set clear agendas to improve!`;
      if (roi > 0) return `📈 Great! Your meetings have +${Math.round(roi)}% ROI. Keep optimizing!`;
      return `📉 Your ROI is ${Math.round(roi)}%. Try shorter meetings with fewer attendees.`;
    }
    
    if (lowerMsg.includes('cost') || lowerMsg.includes('save')) {
      const cost = context.totalCost || 0;
      if (cost === 0) return `💰 No meeting costs recorded. Add attendee counts to see cost analysis!`;
      return `💰 You've spent $${cost.toLocaleString()}. Save by: 1) Keep meetings under 45 min, 2) Limit to 8 attendees.`;
    }
    
    if (lowerMsg.includes('how many')) {
      return `📅 You have ${context.meetingCount || 0} meeting${context.meetingCount !== 1 ? 's' : ''} in your calendar.`;
    }
    
    if (lowerMsg.includes('optimize') || lowerMsg.includes('tip') || lowerMsg.includes('suggestion')) {
      return `💡 Optimization tips: Keep meetings 30-45 min, limit to 5-8 attendees, always have a clear agenda!`;
    }
    
    if (lowerMsg.includes('summary') || lowerMsg.includes('summarize')) {
      return `📝 To get a meeting summary, I need specific meeting details. Try: "Summarize my Q4 planning meeting"`;
    }
    
    if (lowerMsg.includes('schedule') || lowerMsg.includes('best time')) {
      return `📅 Best meeting times: Tuesday 10 AM, Thursday 2 PM, Wednesday 11 AM. Mid-week mornings are most productive!`;
    }
    
    return `💡 I'm your MeetingROI AI Assistant! Ask me about: meeting ROI, cost savings, optimization tips, best practices, or scheduling advice!`;
  }
}

module.exports = GeminiService;