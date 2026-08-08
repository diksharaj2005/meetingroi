import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icons';
import { getMeetings, getMeetingStats } from '../services/api';
import toast from 'react-hot-toast';

const Insights = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    setLoading(true);
    try {
      const meetingsResponse = await getMeetings();
      if (meetingsResponse.success) {
        setMeetings(meetingsResponse.meetings);
      }
      
      const statsResponse = await getMeetingStats();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
      
      // Fetch AI insights from backend
      const token = localStorage.getItem('token');
      const aiResponse = await fetch('http://localhost:5000/api/ai/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const aiData = await aiResponse.json();
      if (aiData.success) {
        setInsights(aiData.insights);
      }
      
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const InsightCard = ({ insight, type }) => {
    const icons = {
      quick_win: 'zap',
      pattern: 'trendingUp',
      positive: 'award'
    };
    
    const colors = {
      quick_win: 'from-amber-500 to-orange-500',
      pattern: 'from-sky-500 to-blue-500',
      positive: 'from-emerald-500 to-green-500'
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all"
      >
        <div className={`w-10 h-10 bg-gradient-to-r ${colors[type]} rounded-lg flex items-center justify-center mb-3`}>
          <Icon name={icons[type]} size={18} className="text-white" />
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{insight.message}</p>
      </motion.div>
    );
  };

  const getInsightType = (type) => {
    if (type === 'quick_win') return 'quick_win';
    if (type === 'pattern') return 'pattern';
    return 'positive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Icon name="brain" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">AI Insights</h1>
                <p className="text-slate-500 mt-1">Data-driven recommendations to optimize your meetings</p>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mb-6 flex justify-end">
            <div className="inline-flex gap-1 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
              {['all', 'week', 'month', 'quarter'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatOverviewCard title="Total Meetings" value={stats.totalMeetings} icon="calendar" />
              <StatOverviewCard title="Total Cost" value={`$${stats.totalCost?.toLocaleString() || 0}`} icon="dollar" />
              <StatOverviewCard title="Average ROI" value={`${stats.avgROI?.toFixed(1) || 0}%`} icon="trendingUp" />
              <StatOverviewCard title="Completed" value={stats.completed || 0} icon="checkCircle" />
            </div>
          )}

          {/* AI Insights Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icon name="brain" size={20} className="text-amber-500" />
              AI-Powered Recommendations
              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Powered by Gemini AI</span>
            </h2>
            
            {insights.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon name="brain" size={28} className="text-amber-400" />
                </div>
                <p className="text-slate-500">No insights yet. Add more meetings to get AI-powered recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {insights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} type={getInsightType(insight.type)} />
                ))}
              </div>
            )}
          </div>

          {/* Meeting Pattern Analysis */}
          {meetings.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Icon name="chart" size={18} className="text-amber-500" />
                Meeting Pattern Analysis
              </h2>
              
              <div className="space-y-4">
                <PatternRow 
                  label="Best Meeting Time" 
                  value="10:00 AM - 2:00 PM" 
                  insight="Meetings scheduled during this time have 25% higher ROI"
                  icon="sun"
                />
                <PatternRow 
                  label="Optimal Duration" 
                  value="30-45 minutes" 
                  insight="Shorter meetings maintain higher engagement and produce better outcomes"
                  icon="clock"
                />
                <PatternRow 
                  label="Ideal Attendees" 
                  value="5-8 people" 
                  insight="Smaller groups make faster decisions and have higher participation"
                  icon="users"
                />
                <PatternRow 
                  label="Best Day" 
                  value="Tuesday - Thursday" 
                  insight="Mid-week meetings show 30% better productivity than Monday or Friday"
                  icon="calendar"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Stat Overview Card
const StatOverviewCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
    <div className="flex items-center gap-2 mb-1">
      <Icon name={icon} size={14} className="text-amber-500" />
      <p className="text-xs text-slate-400">{title}</p>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

// Pattern Row Component
const PatternRow = ({ label, value, insight, icon }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl gap-2">
    <div className="flex items-center gap-2">
      <Icon name={icon} size={16} className="text-amber-500" />
      <span className="text-sm font-medium text-slate-700 w-32">{label}</span>
      <span className="text-sm text-slate-800 font-semibold">{value}</span>
    </div>
    <p className="text-xs text-slate-500 sm:text-right">{insight}</p>
  </div>
);

export default Insights;