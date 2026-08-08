import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icons';
import { createMeeting } from '../services/api';
import toast from 'react-hot-toast';

const AddMeetingModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: [],
    priority: 'medium'
  });
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeRole, setAttendeeRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addAttendee = () => {
    if (attendeeName.trim()) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, { name: attendeeName, role: attendeeRole || 'Participant' }]
      });
      setAttendeeName('');
      setAttendeeRole('');
    }
  };

  const removeAttendee = (index) => {
    const newAttendees = [...formData.attendees];
    newAttendees.splice(index, 1);
    setFormData({ ...formData, attendees: newAttendees });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await createMeeting({
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        attendees: formData.attendees,
        priority: formData.priority
      });
      
      if (response.success) {
        toast.success('Meeting created successfully!');
        onSuccess();
        onClose();
        setFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          attendees: [],
          priority: 'medium'
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Icon name="calendar" size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Schedule Meeting</h2>
                <p className="text-sm text-slate-500">Add a new meeting to track</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Icon name="close" size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Q4 Planning Session"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Meeting agenda, goals, etc."
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`px-4 py-2 rounded-lg capitalize transition ${
                    formData.priority === p
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Attendees
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Name"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm"
              />
              <input
                type="text"
                placeholder="Role (optional)"
                value={attendeeRole}
                onChange={(e) => setAttendeeRole(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm"
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-4 py-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
            
            {/* Attendees List */}
            {formData.attendees.length > 0 && (
              <div className="space-y-2 mt-3">
                {formData.attendees.map((attendee, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{attendee.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{attendee.role}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttendee(idx)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-md transition disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  Creating...
                </div>
              ) : (
                'Create Meeting'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddMeetingModal;