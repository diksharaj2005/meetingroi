import React, { useState } from 'react';
import { Icon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const MeetingCard = ({ meeting, onTrack, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-rose-50 text-rose-600",
      medium: "bg-amber-50 text-amber-600",
      low: "bg-emerald-50 text-emerald-600",
      urgent: "bg-purple-50 text-purple-600"
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-sky-100 text-sky-600",
      ongoing: "bg-emerald-100 text-emerald-600",
      completed: "bg-slate-100 text-slate-600",
      cancelled: "bg-rose-100 text-rose-600"
    };
    return colors[status] || colors.scheduled;
  };

  // Safely format numbers with fallbacks
  const formatCost = (cost) => {
    if (cost === undefined || cost === null || isNaN(cost)) {
      return '0';
    }
    return cost.toLocaleString();
  };

  const formatROI = (roi) => {
    if (roi === undefined || roi === null || isNaN(roi)) {
      return '0';
    }
    return roi > 0 ? `+${roi}%` : `${roi}%`;
  };

  const getROIColor = (roi) => {
    if (roi === undefined || roi === null || isNaN(roi)) {
      return 'bg-slate-50 text-slate-600';
    }
    return roi > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600';
  };

  const formatCostPerAttendee = (cost, attendees) => {
    if (cost === undefined || cost === null || isNaN(cost)) return '0.00';
    if (attendees === undefined || attendees === null || attendees === 0) return '0.00';
    return (cost / attendees).toFixed(2);
  };

  const getImpactColor = (impact) => {
    if (impact === undefined || impact === null || isNaN(impact)) {
      return 'text-slate-600';
    }
    return impact > 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const formatImpact = (impact) => {
    if (impact === undefined || impact === null || isNaN(impact)) {
      return '0%';
    }
    return impact > 0 ? `+${impact}%` : `${impact}%`;
  };

  // Check if AI suggestion exists and is not empty
  const hasAiSuggestion = meeting.aiSuggestion && meeting.aiSuggestion !== 'AI analysis available soon';

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Icon name="calendar" size={14} className="text-white" />
              </div>
              <h4 className="font-semibold text-slate-800">{meeting.title || 'Untitled Meeting'}</h4>
              {meeting.priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(meeting.priority)}`}>
                  {meeting.priority}
                </span>
              )}
              {meeting.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
              )}
              {meeting.isLive && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>

            {/* Meeting Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {meeting.time && (
                <div className="flex items-center gap-1.5">
                  <Icon name="clock" size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{meeting.time}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Icon name="users" size={12} className="text-slate-400" />
                <span className="text-xs text-slate-600">{meeting.attendees || 0} attendees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="dollar" size={12} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-700">${formatCost(meeting.cost)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="trendingUp" size={12} className="text-slate-400" />
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getROIColor(meeting.roi)}`}>
                  ROI: {formatROI(meeting.roi)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onTrack?.(meeting.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-medium rounded-lg hover:opacity-90 transition"
              >
                <Icon name="power" size={12} />
                Track
              </button>
              <button 
                onClick={() => onEdit?.(meeting)}
                className="px-3 py-1.5 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
              >
                <Icon name="edit" size={12} className="inline mr-1" />
                Edit
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-1.5 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition"
              >
                {isExpanded ? 'Less' : 'Details'}
              </button>
              <button 
                onClick={() => onDelete?.(meeting.id)}
                className="px-3 py-1.5 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition"
              >
                <Icon name="trash" size={12} className="inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-3 border-t border-slate-100"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 mb-0.5">Duration</p>
                  <p className="font-medium text-slate-700">{meeting.duration || 0} min</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-0.5">Cost per attendee</p>
                  <p className="font-medium text-slate-700">${formatCostPerAttendee(meeting.cost, meeting.attendees)}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-0.5">Productivity Impact</p>
                  <p className={`font-medium ${getImpactColor(meeting.impact)}`}>
                    {formatImpact(meeting.impact)}
                  </p>
                </div>
                {hasAiSuggestion && (
                  <div className="col-span-2 md:col-span-4 mt-2 p-2 bg-amber-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Icon name="brain" size={12} className="text-amber-500 mt-0.5" />
                      <p className="text-xs text-slate-600">{meeting.aiSuggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeetingCard;