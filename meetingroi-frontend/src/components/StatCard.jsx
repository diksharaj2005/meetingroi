import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icons';

const StatCard = ({ title, value, change, icon, description, trend }) => {
  // Color configurations for different metrics
  const getColorScheme = () => {
    if (title.toLowerCase().includes('cost') || title.toLowerCase().includes('spent')) {
      return {
        bg: "from-amber-400 to-orange-500",
        light: "bg-amber-50",
        border: "border-amber-100",
        text: "text-amber-500",
        iconBg: "bg-amber-100",
        trendUp: "text-emerald-600",
        trendDown: "text-rose-600"
      };
    }
    if (title.toLowerCase().includes('saved') || title.toLowerCase().includes('roi')) {
      return {
        bg: "from-emerald-400 to-green-500",
        light: "bg-emerald-50",
        border: "border-emerald-100",
        text: "text-emerald-600",
        iconBg: "bg-emerald-100",
        trendUp: "text-emerald-600",
        trendDown: "text-amber-600"
      };
    }
    if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('session')) {
      return {
        bg: "from-sky-400 to-blue-500",
        light: "bg-sky-50",
        border: "border-sky-100",
        text: "text-sky-600",
        iconBg: "bg-sky-100",
        trendUp: "text-emerald-600",
        trendDown: "text-rose-600"
      };
    }
    // Default - soft yellow theme
    return {
      bg: "from-amber-300 to-yellow-500",
      light: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
      iconBg: "bg-amber-100",
      trendUp: "text-emerald-600",
      trendDown: "text-rose-600"
    };
  };

  const colors = getColorScheme();
  const isPositive = change > 0;
  const isCostMetric = title.toLowerCase().includes('cost');
  
  // For cost metrics, negative change is good (saving money)
  const isGoodTrend = isCostMetric ? !isPositive : isPositive;
  
  const trendIcon = isPositive ? '↑' : '↓';
  const trendColor = isGoodTrend ? colors.trendUp : colors.trendDown;
  const trendText = isGoodTrend ? 'Better than last week' : 'Needs improvement';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className={`bg-white rounded-2xl p-6 shadow-sm border ${colors.border} hover:shadow-lg transition-all duration-300`}>
        
        <div className="flex justify-between items-start mb-4">
          {/* Left side - Title & Value */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                <Icon name={icon} size={16} className={colors.text} />
              </div>
              <p className="text-sm font-medium text-slate-300">{title}</p>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
              {value}
            </h3>
            
            {description && (
              <p className="text-xs text-slate-400 mb-3">{description}</p>
            )}
            
            {change && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.light} ${colors.text}`}>
                  <span className="text-sm">{trendIcon}</span>
                  <span>{Math.abs(change)}%</span>
                </div>
                <span className="text-xs text-slate-400">{trendText}</span>
              </div>
            )}
          </div>

          {/* Right side - Icon */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
            <div className={`relative w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
              <Icon name={icon} size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Progress Bar (optional) */}
        {trend && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress this month</span>
              <span>{trend.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trend.progress}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{trend.target}</p>
          </div>
        )}

        {/* Insights Tooltip on Hover */}
        <div className="absolute inset-x-0 bottom-full mb-2 mx-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Icon name="brain" size={12} className="text-amber-400" />
              <span>AI Insight: {getInsight(title, change)}</span>
            </div>
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// Helper function for AI insights
const getInsight = (title, change) => {
  const insights = {
    cost: "You're spending 15% less than industry average",
    saved: "Great progress! Keep this momentum",
    meeting: "Meeting efficiency has improved significantly",
    roi: "Your ROI is above target by 8%"
  };
  
  if (title.toLowerCase().includes('cost')) return insights.cost;
  if (title.toLowerCase().includes('saved')) return insights.saved;
  if (title.toLowerCase().includes('meeting')) return insights.meeting;
  if (title.toLowerCase().includes('roi')) return insights.roi;
  
  return change > 0 ? "Positive trend detected" : "Consider reviewing this metric";
};

// Additional Variant: Compact StatCard for dashboards
export const CompactStatCard = ({ title, value, change, icon }) => {
  const isPositive = change > 0;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
            <Icon name={icon} size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">{title}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Additional Variant: Gradient StatCard for highlights
export const GradientStatCard = ({ title, value, icon, color = "yellow" }) => {
  const gradients = {
    yellow: "from-amber-400 to-yellow-500",
    green: "from-emerald-400 to-green-500",
    blue: "from-sky-400 to-blue-500"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex justify-between items-start mb-3">
        <Icon name={icon} size={24} className="text-white/80" />
        <div className="text-right">
          <p className="text-xs text-white/70 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-white/80 flex items-center gap-1">
          <Icon name="trendingUp" size={12} />
          +12% from last month
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;