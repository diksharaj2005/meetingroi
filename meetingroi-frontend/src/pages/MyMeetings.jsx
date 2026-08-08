import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MeetingCard from '../components/MeetingCard';
import { Icon } from '../components/Icons';
import { getMeetings, getMeetingStats, deleteMeeting } from '../services/api';
import toast from 'react-hot-toast';
import EditMeetingModal from '../components/EditMeetingModal';

const MyMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    totalCost: 0,
    avgROI: 0
  });

  // Fetch real data from backend
  useEffect(() => {
    fetchMeetingsData();
  }, []);

  const fetchMeetingsData = async () => {
    setLoading(true);
    try {
      // Fetch meetings from API
      const meetingsResponse = await getMeetings();
      console.log('Meetings from API:', meetingsResponse);
      
      if (meetingsResponse.success) {
        const meetingList = meetingsResponse.meetings;
        setMeetings(meetingList);
        setFilteredMeetings(meetingList);
        
        // Calculate stats from real data
        const total = meetingList.length;
        const upcoming = meetingList.filter(m => m.status === 'scheduled').length;
        const completed = meetingList.filter(m => m.status === 'completed').length;
        const totalCost = meetingList.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
        const avgROI = total > 0 ? meetingList.reduce((sum, m) => sum + (parseFloat(m.roi) || 0), 0) / total : 0;
        
        setStats({ total, upcoming, completed, totalCost, avgROI });
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // Filter meetings
  useEffect(() => {
    let filtered = [...meetings];
    
    if (filter === 'upcoming') {
      filtered = meetings.filter(m => m.status === 'scheduled');
    } else if (filter === 'completed') {
      filtered = meetings.filter(m => m.status === 'completed');
    } else if (filter === 'high-roi') {
      filtered = meetings.filter(m => parseFloat(m.roi) > 20);
    } else if (filter === 'negative-roi') {
      filtered = meetings.filter(m => parseFloat(m.roi) < 0);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMeetings(filtered);
  }, [filter, searchQuery, meetings]);

  const handleTrackMeeting = (meetingId) => {
    toast.success(`🎯 Tracking meeting #${meetingId} in real-time!`, {
      duration: 3000,
      icon: '📊'
    });
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId);
        toast.success('Meeting deleted successfully');
        fetchMeetingsData(); // Refresh list
      } catch (error) {
        toast.error('Failed to delete meeting');
      }
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setIsEditModalOpen(true);
  };

  const handleMeetingUpdated = () => {
    fetchMeetingsData(); // Refresh after edit
  };

  // Format meetings for MeetingCard component
  const formattedFilteredMeetings = filteredMeetings.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    time: new Date(meeting.startTime).toLocaleString(),
    endTime: meeting.endTime,
    attendees: meeting.attendeeCount,
    cost: parseFloat(meeting.cost),
    duration: (new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60),
    roi: parseFloat(meeting.roi),
    impact: parseFloat(meeting.productivityImpact) || 0,
    accuracy: 87,
    isLive: meeting.status === 'ongoing',
    priority: meeting.priority,
    status: meeting.status,
    organizer: user?.name || 'You',
    location: meeting.calendarSource === 'google' ? 'Google Calendar' : 'Manual Entry'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">My Meetings</h1>
            <p className="text-slate-500 mt-1">Manage and track all your meetings</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatBadge label="Total Meetings" value={stats.total} icon="calendar" color="amber" />
            <StatBadge label="Upcoming" value={stats.upcoming} icon="clock" color="sky" />
            <StatBadge label="Completed" value={stats.completed} icon="checkCircle" color="emerald" />
            <StatBadge label="Total Cost" value={`$${stats.totalCost.toLocaleString()}`} icon="dollar" color="rose" />
            <StatBadge label="Avg ROI" value={`${stats.avgROI.toFixed(0)}%`} icon="trendingUp" color="emerald" />
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                {['all', 'upcoming', 'completed', 'high-roi', 'negative-roi'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                      filter === f
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    {f.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none text-sm w-64"
                />
              </div>

              <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}
                >
                  <Icon name="menu" size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400'}`}
                >
                  <Icon name="grid" size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Meetings List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-amber-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : formattedFilteredMeetings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              <AnimatePresence>
                {formattedFilteredMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <MeetingCard 
                      meeting={meeting} 
                      onTrack={handleTrackMeeting}
                      onEdit={handleEditMeeting}
                      onDelete={handleDeleteMeeting}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Edit Meeting Modal */}
      <EditMeetingModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMeeting(null);
        }}
        meeting={editingMeeting}
        onSuccess={handleMeetingUpdated}
      />
    </div>
  );
};

// Stat Badge Component
const StatBadge = ({ label, value, icon, color }) => {
  const colors = {
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon name={icon} size={14} />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Icon name="calendar" size={32} className="text-amber-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-1">No meetings found</h3>
    <p className="text-slate-500">Create your first meeting to get started</p>
  </div>
);

export default MyMeetings;