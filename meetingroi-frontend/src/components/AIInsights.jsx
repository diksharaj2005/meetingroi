import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AIInsights = ({ onRefresh }) => {
  const [insights, setInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/insights', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'warning': return 'alert';
      case 'success': return 'success';
      default: return 'brain';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'warning': return 'from-rose-500 to-red-500';
      case 'success': return 'from-emerald-500 to-green-500';
      default: return 'from-sky-500 to-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="h-20 bg-slate-100 rounded-xl mb-3"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Banner */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="brain" size={20} className="text-purple-600" />
            <h3 className="font-semibold text-purple-800">AI Insights</h3>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              Powered by AI
            </span>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl bg-white border-l-4 border-${insight.type === 'warning' ? 'rose' : insight.type === 'success' ? 'emerald' : 'sky'}-500 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon name={getInsightIcon(insight.type)} size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{insight.title}</h4>
                    <p className="text-slate-600 text-xs mt-1">{insight.message}</p>
                    <p className="text-amber-600 text-xs mt-2 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="sparkles" size={20} className="text-amber-500" />
            <h3 className="font-semibold text-slate-800">Optimization Suggestions</h3>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSuggestion(expandedSuggestion === idx ? null : idx)}
                  className="w-full p-4 text-left hover:bg-slate-50 transition flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{suggestion.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">{suggestion.description}</p>
                    {suggestion.potentialSavings > 0 && (
                      <p className="text-emerald-600 text-xs mt-1">
                        💰 Potential savings: ${suggestion.potentialSavings.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Icon name={expandedSuggestion === idx ? 'chevronUp' : 'chevronDown'} size={16} className="text-slate-400" />
                </button>
                
                {expandedSuggestion === idx && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="px-4 pb-4 border-t border-slate-100 pt-3"
                  >
                    <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                      {suggestion.action}
                      <Icon name="arrowRight" size={12} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;