import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/Icons';
import toast from 'react-hot-toast';

const Team = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('efficiency');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setTeam(data.team);
        setTeamStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/team/invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setShowAddModal(false);
        setNewMember({ name: '', email: '', role: '', department: '' });
        fetchTeamData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Product': 'bg-purple-100 text-purple-600',
      'Engineering': 'bg-blue-100 text-blue-600',
      'Design': 'bg-pink-100 text-pink-600',
      'Marketing': 'bg-green-100 text-green-600',
      'Sales': 'bg-orange-100 text-orange-600',
      'Leadership': 'bg-amber-100 text-amber-600'
    };
    return colors[department] || 'bg-slate-100 text-slate-600';
  };

  // ✅ Helper functions - handle null properly
  const getEfficiencyDisplay = (efficiency) => {
    if (efficiency === null || efficiency === undefined || efficiency === 0) {
      return 'No data';
    }
    return `${Math.round(efficiency)}%`;
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency === null || efficiency === undefined || efficiency === 0) {
      return 'text-slate-400 bg-slate-100';
    }
    if (efficiency >= 80) return 'text-emerald-600 bg-emerald-50';
    if (efficiency >= 60) return 'text-amber-600 bg-amber-50';
    if (efficiency >= 40) return 'text-blue-600 bg-blue-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getEfficiencyProgress = (efficiency) => {
    if (efficiency === null || efficiency === undefined || efficiency === 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, efficiency));
  };

  const hasEfficiencyData = (efficiency) => {
    return efficiency !== null && efficiency !== undefined && efficiency > 0;
  };

  const sortedTeam = [...team].sort((a, b) => {
    const aVal = a.efficiency !== null && a.efficiency !== undefined ? a.efficiency : -1;
    const bVal = b.efficiency !== null && b.efficiency !== undefined ? b.efficiency : -1;
    
    if (sortBy === 'efficiency') return bVal - aVal;
    if (sortBy === 'meetings') return (b.meetingsCount || 0) - (a.meetingsCount || 0);
    if (sortBy === 'cost') return (b.totalCost || 0) - (a.totalCost || 0);
    return 0;
  });

  const departments = ['all', ...new Set(team.map(m => m.department).filter(Boolean))];

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
          
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Team</h1>
              <p className="text-slate-500 mt-1">Manage your team members and their meeting analytics</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:shadow-md transition"
            >
              <Icon name="plus" size={16} />
              Add Team Member
            </button>
          </div>

          {/* Team Stats Cards */}
          {teamStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatsCard title="Team Members" value={teamStats.totalMembers} icon="users" color="amber" />
              <StatsCard title="Total Meetings" value={teamStats.totalMeetings || 0} icon="calendar" color="sky" />
              <StatsCard title="Total Cost" value={`$${teamStats.totalCost?.toLocaleString() || 0}`} icon="dollar" color="rose" />
              <StatsCard 
                title="Avg Efficiency" 
                value={teamStats.avgEfficiency > 0 ? `${Math.round(teamStats.avgEfficiency)}%` : 'No data'} 
                icon="activity" 
                color="emerald" 
              />
            </div>
          )}

          {/* Top Performers */}
          {teamStats && teamStats.mostEfficient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <TopPerformerCard 
                title="🏆 Most Efficient"
                member={teamStats.mostEfficient}
                value={getEfficiencyDisplay(teamStats.mostEfficient?.efficiency)}
                hasData={hasEfficiencyData(teamStats.mostEfficient?.efficiency)}
              />
              <TopPerformerCard 
                title="📊 Needs Improvement"
                member={teamStats.needsImprovement}
                value={getEfficiencyDisplay(teamStats.needsImprovement?.efficiency)}
                hasData={hasEfficiencyData(teamStats.needsImprovement?.efficiency)}
                isWarning
              />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedRole(dept)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${
                      selectedRole === dept
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                <button 
                  onClick={() => setSortBy('efficiency')} 
                  className={`px-3 py-1.5 text-xs rounded-md transition ${
                    sortBy === 'efficiency' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'
                  }`}
                >
                  Sort by Efficiency
                </button>
                <button 
                  onClick={() => setSortBy('meetings')} 
                  className={`px-3 py-1.5 text-xs rounded-md transition ${
                    sortBy === 'meetings' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'
                  }`}
                >
                  Sort by Meetings
                </button>
                <button 
                  onClick={() => setSortBy('cost')} 
                  className={`px-3 py-1.5 text-xs rounded-md transition ${
                    sortBy === 'cost' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'
                  }`}
                >
                  Sort by Cost
                </button>
              </div>
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedTeam.filter(m => selectedRole === 'all' || m.department === selectedRole).map((member, idx) => (
              <TeamMemberCard 
                key={member.id} 
                member={member} 
                idx={idx}
                getDepartmentColor={getDepartmentColor}
                getEfficiencyColor={getEfficiencyColor}
                getEfficiencyDisplay={getEfficiencyDisplay}
                getEfficiencyProgress={getEfficiencyProgress}
                hasEfficiencyData={hasEfficiencyData}
              />
            ))}
          </div>

          {/* Empty State */}
          {sortedTeam.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="users" size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No team members yet</h3>
              <p className="text-slate-500 text-sm">Click "Add Team Member" to build your team</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Add Team Member</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={newMember.name} 
                onChange={(e) => setNewMember({...newMember, name: e.target.value})} 
                className="w-full p-2 border rounded-lg" 
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={newMember.email} 
                onChange={(e) => setNewMember({...newMember, email: e.target.value})} 
                className="w-full p-2 border rounded-lg" 
                required 
              />
              <input 
                type="text" 
                placeholder="Role" 
                value={newMember.role} 
                onChange={(e) => setNewMember({...newMember, role: e.target.value})} 
                className="w-full p-2 border rounded-lg" 
                required 
              />
              <select 
                value={newMember.department} 
                onChange={(e) => setNewMember({...newMember, department: e.target.value})} 
                className="w-full p-2 border rounded-lg" 
                required
              >
                <option value="">Select Department</option>
                <option value="Product">Product</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-2 rounded-lg font-medium hover:shadow-md transition"
              >
                Add Member
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => {
  const colors = { 
    amber: "bg-amber-50 text-amber-600", 
    sky: "bg-sky-50 text-sky-600", 
    rose: "bg-rose-50 text-rose-600", 
    emerald: "bg-emerald-50 text-emerald-600" 
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon name={icon} size={18} />
        </div>
        <div>
          <p className="text-xs text-slate-400">{title}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Top Performer Card
const TopPerformerCard = ({ title, member, value, isWarning, hasData }) => (
  <div className={`bg-white rounded-xl p-4 border ${
    isWarning ? 'border-amber-200 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'
  }`}>
    <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
    {member && (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
          {member.avatar}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{member.name}</p>
          <p className="text-xs text-slate-500">{member.role}</p>
        </div>
        <div className="ml-auto">
          <p className={`text-xl font-bold ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
            {hasData ? value : 'No data'}
          </p>
        </div>
      </div>
    )}
  </div>
);

// Team Member Card
const TeamMemberCard = ({ member, getDepartmentColor, getEfficiencyColor, getEfficiencyDisplay, getEfficiencyProgress, hasEfficiencyData }) => {
  const hasData = hasEfficiencyData(member.efficiency);
  const efficiencyValue = getEfficiencyProgress(member.efficiency);
  const displayValue = getEfficiencyDisplay(member.efficiency);
  const colorClass = getEfficiencyColor(member.efficiency);

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
            {member.avatar}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            member.status === 'active' ? 'bg-emerald-500' : 
            member.status === 'invited' ? 'bg-amber-500' : 'bg-slate-400'
          }`}></div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{member.name}</h3>
          <p className="text-sm text-slate-500">{member.role}</p>
          {member.department && (
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getDepartmentColor(member.department)}`}>
              {member.department}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Meetings</span>
          <span className="text-sm font-medium">{member.meetingsCount || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Cost</span>
          <span className="text-sm font-medium text-rose-600">${(member.totalCost || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">ROI</span>
          <span className={`text-sm font-medium ${(member.avgROI || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {(member.avgROI || 0) > 0 ? '+' : ''}{(member.avgROI || 0)}%
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Efficiency Score</span>
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {hasData ? displayValue : 'No data'}
          </span>
        </div>
        {hasData && member.efficiency > 0 && (
          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"
              style={{ width: `${efficiencyValue}%` }}
            />
          </div>
        )}
        {!hasData && (
          <div className="mt-2 text-center">
            <span className="text-xs text-slate-400">
              Add meetings to see efficiency score
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Team;