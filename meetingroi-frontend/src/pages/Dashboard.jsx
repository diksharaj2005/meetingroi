import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import StatCard from "../components/StatCard";
import MeetingCard from "../components/MeetingCard";
import { Icon } from "../components/Icons";
import { getMeetings, getMeetingStats, deleteMeeting } from "../services/api";
import toast from "react-hot-toast";
import AddMeetingModal from "../components/AddMeetingModal";
import EditMeetingModal from "../components/EditMeetingModal";
import GoogleCalendarSync from "../components/GoogleCalendarSync";
import MeetingCharts from "../components/MeetingCharts";
import PowerBIExport from "../components/PowerBIExport";

const Dashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    totalCost: 0,
    meetingsToday: 0,
    avgROI: 0,
    savedMoney: 0,
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [showWelcome, setShowWelcome] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, aiResponse, aiLoading]);

  // Check if calendar is connected on load
  useEffect(() => {
    const checkCalendarConnection = async () => {
      const connected = localStorage.getItem("google_connected") === "true";
      setIsCalendarConnected(connected);
    };
    checkCalendarConnection();
  }, []);

  // Fetch real data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const meetingsResponse = await getMeetings();
      if (meetingsResponse.success) {
        setMeetings(meetingsResponse.meetings);
      }

      const statsResponse = await getMeetingStats();
      if (statsResponse.success) {
        const statsData = statsResponse.stats;
        setStats({
          totalCost: statsData.totalCost || 0,
          meetingsToday: statsData.totalMeetings || 0,
          avgROI: statsData.avgROI || 0,
          savedMoney: Math.round((statsData.totalCost || 0) * 0.2),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setTimeout(() => setShowWelcome(false), 5000);
    }
  };

  const handleTrackMeeting = (meetingId) => {
    toast.success(`🎯 Tracking meeting #${meetingId} in real-time!`, {
      duration: 3000,
      icon: "📊",
      style: {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      },
    });
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setIsEditModalOpen(true);
  };

  const handleMeetingUpdated = () => {
    fetchDashboardData();
  };

  const handleMeetingCreated = () => {
    fetchDashboardData();
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await deleteMeeting(meetingId);
        toast.success("Meeting deleted successfully");
        fetchDashboardData();
      } catch (error) {
        toast.error("Failed to delete meeting");
      }
    }
  };

  const handleCalendarSyncComplete = () => {
    setIsCalendarConnected(true);
    fetchDashboardData();
  };

  const handleAIQuery = async () => {
    if (!aiMessage.trim() || aiLoading) return;

    const userQuestion = aiMessage.trim();
    setChatHistory((prev) => [
      ...prev,
      { type: "user", message: userQuestion },
    ]);
    setAiMessage("");
    setAiLoading(true);
    setAiResponse("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuestion,
          context: {
            meetingCount: meetings.length,
            totalCost: stats.totalCost,
            avgROI: stats.avgROI,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiResponse(data.response);
        setChatHistory((prev) => [
          ...prev,
          { type: "ai", message: data.response },
        ]);
      } else {
        const errorMsg =
          "Sorry, I could not process your request. Please try again.";
        setAiResponse(errorMsg);
        setChatHistory((prev) => [...prev, { type: "ai", message: errorMsg }]);
      }
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMsg =
        "Unable to connect to AI assistant. Please check your connection.";
      setAiResponse(errorMsg);
      setChatHistory((prev) => [...prev, { type: "ai", message: errorMsg }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Format meetings for display
  const formattedMeetings = meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    time:
      new Date(meeting.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " - " +
      new Date(meeting.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    attendees: meeting.attendeeCount,
    cost: parseFloat(meeting.cost),
    duration:
      (new Date(meeting.endTime) - new Date(meeting.startTime)) / (1000 * 60),
    roi: parseFloat(meeting.roi),
    impact: parseFloat(meeting.productivityImpact) || 0,
    isLive: meeting.status === "ongoing",
    priority: meeting.priority,
    status: meeting.status,
    sentiment: meeting.sentiment || "Neutral",
    actionItems: meeting.actionItems || "0 generated",
    aiSuggestion: meeting.aiSuggestion || "AI analysis available soon",
    recommendation: meeting.recommendation || "Optimize meeting structure",
  }));

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const liveCount = meetings.filter((m) => m.status === "ongoing").length;

  const QuickActionCard = ({
    icon,
    title,
    description,
    buttonText,
    color,
    onClick,
  }) => {
    const colors = {
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        button: "hover:bg-amber-50 text-amber-600",
      },
      sky: {
        bg: "bg-sky-100",
        text: "text-sky-600",
        button: "hover:bg-sky-50 text-sky-600",
      },
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        button: "hover:bg-emerald-50 text-emerald-600",
      },
    };

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={`rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div
          className={`w-12 h-12 ${colors[color].bg} rounded-xl flex items-center justify-center mx-auto mb-4`}
        >
          <Icon name={icon} size={24} className={colors[color].text} />
        </div>
        <h3
          className={`font-semibold text-center mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          {title}
        </h3>
        <p
          className={`text-sm text-center mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          {description}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all ${colors[color].button} border border-slate-200 dark:border-slate-600`}
        >
          {buttonText} →
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-amber-50 via-white to-sky-50"
      }`}
    >
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-2xl p-6 border mb-8 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-gradient-to-r from-amber-100 via-yellow-50 to-sky-100 border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-md">
                      <span className="text-2xl">👋</span>
                    </div>
                    <div>
                      <h1
                        className={`text-2xl font-bold mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        Welcome back, {user?.name?.split(" ")[0] || "User"}!
                      </h1>
                      <p
                        className={
                          darkMode ? "text-amber-400" : "text-amber-700"
                        }
                      >
                        You have {liveCount} live meetings right now
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className={
                      darkMode
                        ? "text-amber-500 hover:text-amber-400"
                        : "text-amber-400 hover:text-amber-600"
                    }
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Period Selector, Add Button, and PowerBI Export */}
          <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
            <div
              className={`inline-flex gap-1 p-1 rounded-xl shadow-sm border ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              {["today", "week", "month", "quarter"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm"
                      : darkMode
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-slate-600 hover:bg-amber-50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:shadow-md transition text-sm font-medium"
              >
                <Icon name="plus" size={16} />
                Add Meeting
              </button>
              <PowerBIExport meetings={meetings} />
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
          >
            <motion.div variants={fadeInUp}>
              <StatCard
                title="Total Meeting Cost"
                value={
                  stats.totalCost !== null && stats.totalCost !== undefined
                    ? `$${stats.totalCost.toLocaleString()}`
                    : "$0"
                }
                icon="dollar"
                description="This period"
                loading={loading}
                darkMode={darkMode}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <StatCard
                title="Meetings Held"
                value={stats.meetingsToday}
                icon="calendar"
                description="This period"
                loading={loading}
                darkMode={darkMode}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <StatCard
                title="Average ROI"
                value={`${stats.avgROI}%`}
                icon="trendingUp"
                description="Per meeting"
                loading={loading}
                darkMode={darkMode}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <StatCard
                title="Money Saved"
                value={`$${stats.savedMoney.toLocaleString()}`}
                icon="zap"
                description="From optimizations"
                loading={loading}
                darkMode={darkMode}
              />
            </motion.div>
          </motion.div>

          {/* Feature Cards Section */}
          <div className="mb-8">
            <h3
              className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FeatureCard
                icon="refresh"
                title="Auto Sync"
                description="Meetings sync from Google Calendar"
                badge="Coming Soon"
                darkMode={darkMode}
              />
              <FeatureCard
                icon="brain"
                title="AI Analysis"
                description="ROI predictions & optimization"
                darkMode={darkMode}
              />
              <FeatureCard
                icon="chart"
                title="Cost Tracking"
                description="Automatic cost calculation"
                darkMode={darkMode}
              />
              <FeatureCard
                icon="download"
                title="PowerBI Export"
                description="Export reports to PowerBI"
                darkMode={darkMode}
              />
            </div>
          </div>

          {/* AI Insights Banner - Always same (gradient) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-gradient-to-r from-amber-500 via-yellow-500 to-sky-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Icon name="brain" size={24} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">AI Insight</h3>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      Powered by Google Gemini
                    </span>
                  </div>
                  <p className="text-white/95 max-w-2xl">
                    Based on your {stats.meetingsToday} meetings, you could save{" "}
                    <strong className="text-white">
                      ${Math.round(stats.totalCost * 0.2)}
                    </strong>{" "}
                    by optimizing meeting duration and attendee count.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-white text-amber-600 rounded-xl hover:shadow-lg transition flex items-center gap-2 font-medium"
              >
                <Icon name="sparkles" size={16} />
                Optimize Now
              </motion.button>
            </div>
          </motion.div>

          {/* Charts Section */}
          {!loading && meetings.length > 0 && (
            <div className="mb-8">
              <MeetingCharts meetings={meetings} darkMode={darkMode} />
            </div>
          )}

          {/* Meetings Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2
                  className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  Your Meetings
                </h2>
                <p
                  className={`text-sm mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {formattedMeetings.length} total meetings
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-amber-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
              </div>
            ) : formattedMeetings.length === 0 ? (
              <div
                className={`text-center py-16 rounded-2xl border ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    darkMode ? "bg-slate-700" : "bg-amber-50"
                  }`}
                >
                  <Icon name="calendar" size={32} className="text-amber-400" />
                </div>
                <h3
                  className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  No meetings yet
                </h3>
                <p
                  className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  Create your first meeting to get started
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg text-sm font-medium"
                >
                  Schedule Meeting →
                </button>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
              >
                <AnimatePresence>
                  {formattedMeetings.map((meeting, idx) => (
                    <motion.div
                      key={meeting.id}
                      variants={fadeInUp}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <MeetingCard
                        meeting={meeting}
                        onTrack={handleTrackMeeting}
                        onEdit={handleEditMeeting}
                        onDelete={handleDeleteMeeting}
                        darkMode={darkMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Google Calendar Sync */}
          <div className="mt-4">
            <GoogleCalendarSync
              onSyncComplete={handleCalendarSyncComplete}
              darkMode={darkMode}
            />
          </div>

          {/* AI Chat Assistant */}
          <div className="fixed bottom-6 right-6 z-40">
            {showAIChat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className={`absolute bottom-16 right-0 mb-2 w-96 rounded-2xl shadow-xl border overflow-hidden ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Icon
                          name="sparkles"
                          size={16}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-sm">
                          AI Assistant
                        </span>
                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full ml-2">
                          Gemini AI
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAIChat(false)}
                      className="text-white/80 hover:text-white transition p-1"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-96 flex flex-col">
                  <div
                    className={`flex-1 p-4 overflow-y-auto space-y-3 ${darkMode ? "bg-slate-800" : "bg-white"}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon
                          name="sparkles"
                          size={12}
                          className="text-white"
                        />
                      </div>
                      <div
                        className={`rounded-2xl rounded-tl-none px-3 py-2 max-w-[85%] ${
                          darkMode
                            ? "bg-slate-700 text-slate-200"
                            : "bg-amber-50 text-slate-700"
                        }`}
                      >
                        <p className="text-xs">
                          💡 Ask me about your meetings, ROI predictions, or
                          optimization tips!
                        </p>
                      </div>
                    </div>

                    {chatHistory.map((chat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 ${chat.type === "user" ? "justify-end" : ""}`}
                      >
                        {chat.type === "ai" && (
                          <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon
                              name="sparkles"
                              size={12}
                              className="text-white"
                            />
                          </div>
                        )}
                        <div
                          className={`${
                            chat.type === "user"
                              ? darkMode
                                ? "bg-amber-900/50 rounded-2xl rounded-tr-none text-slate-200"
                                : "bg-amber-100 rounded-2xl rounded-tr-none text-slate-700"
                              : darkMode
                                ? "bg-slate-700 rounded-2xl rounded-tl-none text-slate-200"
                                : "bg-slate-100 rounded-2xl rounded-tl-none text-slate-700"
                          } px-3 py-2 max-w-[85%]`}
                        >
                          <p className="text-xs whitespace-pre-wrap">
                            {chat.message}
                          </p>
                        </div>
                        {chat.type === "user" && (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              darkMode
                                ? "bg-amber-800 text-amber-300"
                                : "bg-amber-200 text-amber-600"
                            }`}
                          >
                            <Icon name="user" size={12} />
                          </div>
                        )}
                      </div>
                    ))}

                    {aiLoading && (
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon
                            name="sparkles"
                            size={12}
                            className="text-white"
                          />
                        </div>
                        <div
                          className={`rounded-2xl rounded-tl-none px-4 py-3 ${
                            darkMode ? "bg-slate-700" : "bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  <div
                    className={`p-4 border-t ${
                      darkMode
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiMessage}
                        onChange={(e) => setAiMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (
                            e.key === "Enter" &&
                            !aiLoading &&
                            aiMessage.trim()
                          ) {
                            handleAIQuery();
                          }
                        }}
                        placeholder="Ask me anything..."
                        className={`flex-1 px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all ${
                          darkMode
                            ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                        }`}
                        disabled={aiLoading}
                      />
                      <button
                        onClick={handleAIQuery}
                        disabled={aiLoading || !aiMessage.trim()}
                        className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {aiLoading ? (
                          <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        )}
                      </button>
                    </div>
                    <p
                      className={`text-xs text-center mt-2 ${darkMode ? "text-slate-400" : "text-slate-400"}`}
                    >
                      Powered by Google Gemini AI
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIChat(!showAIChat)}
              className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all hover:from-amber-600 hover:to-yellow-600"
            >
              <Icon name="sparkles" size={24} />
            </motion.button>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleMeetingCreated}
      />

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

// Feature Card Component
const FeatureCard = ({ icon, title, description, badge, darkMode }) => (
  <div className={`rounded-xl p-4 border text-center hover:shadow-md transition-all ${
    darkMode 
      ? 'bg-slate-800 border-slate-700' 
      : 'bg-white border-slate-200'
  }`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
      darkMode ? 'bg-amber-900/50' : 'bg-amber-100'
    }`}>
      <Icon name={icon} size={22} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
    </div>
    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      {title}
    </h3>
    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      {description}
    </p>
    {badge && (
      <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${
        darkMode 
          ? 'bg-amber-900/50 text-amber-400' 
          : 'bg-amber-100 text-amber-700'
      }`}>
        {badge}
      </span>
    )}
  </div>
);

export default Dashboard;