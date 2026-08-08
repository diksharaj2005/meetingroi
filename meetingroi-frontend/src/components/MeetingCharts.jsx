import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Icon } from './Icons';
import { getMeetings } from '../services/api';

const MeetingCharts = ({ meetings }) => {
  const [chartData, setChartData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [costByPriority, setCostByPriority] = useState([]);
  const [activeTab, setActiveTab] = useState('trend');

  useEffect(() => {
    if (meetings && meetings.length > 0) {
      processChartData(meetings);
    }
  }, [meetings]);

  const processChartData = (meetingsList) => {
    // Group by date for trend chart
    const groupedByDate = {};
    meetingsList.forEach(meeting => {
      const date = new Date(meeting.startTime).toLocaleDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, cost: 0, count: 0, roi: 0 };
      }
      groupedByDate[date].cost += parseFloat(meeting.cost) || 0;
      groupedByDate[date].count += 1;
      groupedByDate[date].roi += parseFloat(meeting.roi) || 0;
    });
    
    const trendData = Object.values(groupedByDate).slice(-7).map(d => ({
      ...d,
      avgRoi: d.roi / d.count,
    }));
    setChartData(trendData);

    // ROI by meeting type
    const roiByMeeting = meetingsList.slice(-10).map(m => ({
      name: m.title?.length > 20 ? m.title.substring(0, 20) + '...' : m.title,
      roi: parseFloat(m.roi) || 0,
      cost: parseFloat(m.cost) || 0,
    }));
    setRoiData(roiByMeeting);

    // Cost by priority
    const priorityColors = { high: '#f97316', medium: '#eab308', low: '#22c55e', urgent: '#ef4444' };
    const priorityCost = {};
    meetingsList.forEach(m => {
      const p = m.priority || 'medium';
      priorityCost[p] = (priorityCost[p] || 0) + (parseFloat(m.cost) || 0);
    });
    setCostByPriority(Object.entries(priorityCost).map(([name, value]) => ({ name, value, color: priorityColors[name] })));
  };

  const COLORS = ['#f97316', '#eab308', '#22c55e', '#ef4444', '#3b82f6'];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setActiveTab('trend')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'trend' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Cost Trend
        </button>
        <button onClick={() => setActiveTab('roi')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'roi' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          ROI Analysis
        </button>
        <button onClick={() => setActiveTab('priority')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'priority' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          Cost by Priority
        </button>
      </div>

      <div className="h-80">
        {activeTab === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#f97316" name="Cost ($)" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgRoi" stroke="#22c55e" name="Avg ROI (%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'roi' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="roi" fill="#f97316" name="ROI (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'priority' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={costByPriority} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {costByPriority.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MeetingCharts;