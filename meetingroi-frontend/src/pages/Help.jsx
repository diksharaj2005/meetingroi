import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Icon } from '../components/Icons';
import toast from 'react-hot-toast';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How does MeetingROI calculate meeting costs?",
      answer: "MeetingROI calculates costs based on attendee salaries (averaged by role), meeting duration, and overhead costs. You can set custom salary rates in Settings.",
      category: "calculation"
    },
    {
      id: 2,
      question: "Can I connect multiple calendars?",
      answer: "Yes! MeetingROI supports Google Calendar, Microsoft Outlook, and Apple Calendar. Connect them all in the Integrations section.",
      category: "integration"
    },
    {
      id: 3,
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, never store raw calendar data, and are GDPR compliant. Your data never leaves your control.",
      category: "security"
    },
    {
      id: 4,
      question: "How does the PowerBI export work?",
      answer: "One-click export generates a PowerBI template with pre-built DAX measures. Just download and upload to your PowerBI workspace.",
      category: "powerbi"
    },
    {
      id: 5,
      question: "Can I get meeting cost alerts?",
      answer: "Yes! Set budget thresholds and get Slack/Email notifications when meetings exceed expected costs.",
      category: "alerts"
    },
    {
      id: 6,
      question: "How accurate are the AI insights?",
      answer: "Our AI models achieve 87-94% accuracy based on historical patterns. Accuracy improves as you use the platform more.",
      category: "ai"
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      description: "Learn the basics of MeetingROI in 5 minutes",
      icon: "rocket",
      color: "amber",
      readTime: "5 min"
    },
    {
      title: "Setting Up Integrations",
      description: "Connect calendars, Slack, and PowerBI",
      icon: "settings",
      color: "sky",
      readTime: "10 min"
    },
    {
      title: "Understanding Analytics",
      description: "Deep dive into metrics and insights",
      icon: "chart",
      color: "emerald",
      readTime: "8 min"
    },
    {
      title: "Optimizing Meeting ROI",
      description: "Best practices to reduce meeting waste",
      icon: "trendingUp",
      color: "purple",
      readTime: "12 min"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = ['all', 'calculation', 'integration', 'security', 'powerbi', 'alerts', 'ai'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-800">Help Center</h1>
            <p className="text-slate-500 mt-2">Everything you need to know about MeetingROI</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <ActionButton label="📞 Contact Support" onClick={() => toast.success('Support ticket created!')} />
            <ActionButton label="📚 Documentation" onClick={() => toast.success('Opening docs...')} />
            <ActionButton label="💬 Live Chat" onClick={() => toast.success('Chat connecting...')} />
            <ActionButton label="🐛 Report Bug" onClick={() => toast.success('Bug report submitted')} />
          </div>

          {/* Guide Cards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Getting Started Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {guides.map((guide, idx) => (
                <GuideCard key={idx} guide={guide} />
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Frequently Asked Questions</h2>
              <p className="text-slate-500 text-sm mt-1">Can't find what you're looking for? Contact support</p>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="max-w-3xl mx-auto space-y-3">
              {filteredFaqs.map((faq) => (
                <FaqItem 
                  key={faq.id} 
                  faq={faq} 
                  isExpanded={expandedFaq === faq.id}
                  onToggle={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                />
              ))}
              
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">No matching questions found. Try another search term.</p>
                </div>
              )}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-200">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                <Icon name="messageCircle" size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Still need help?</h3>
              <p className="text-slate-500 mb-4">Our support team is ready to assist you</p>
              <button 
                onClick={() => toast.success('Contacting support...')}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-medium hover:shadow-md transition"
              >
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-4 py-2 bg-white rounded-full text-sm text-slate-600 hover:text-amber-600 border border-slate-200 hover:border-amber-200 hover:shadow-sm transition-all"
  >
    {label}
  </motion.button>
);

// Guide Card Component
const GuideCard = ({ guide }) => {
  const colors = {
    amber: "from-amber-400 to-yellow-500",
    sky: "from-sky-400 to-blue-500",
    emerald: "from-emerald-400 to-green-500",
    purple: "from-purple-400 to-pink-500"
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[guide.color]} rounded-lg flex items-center justify-center mb-3`}>
        <Icon name={guide.icon} size={18} className="text-white" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{guide.title}</h3>
      <p className="text-xs text-slate-500 mb-2">{guide.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{guide.readTime} read</span>
        <button className="text-xs text-amber-600 hover:text-amber-700">Read →</button>
      </div>
    </motion.div>
  );
};

// FAQ Item Component
const FaqItem = ({ faq, isExpanded, onToggle }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
    >
      <span className="font-medium text-slate-800">{faq.question}</span>
      <Icon name={isExpanded ? "chevronUp" : "chevronDown"} size={18} className="text-slate-400 flex-shrink-0" />
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-slate-100"
        >
          <div className="px-5 py-4 bg-slate-50/50">
            <p className="text-sm text-slate-600">{faq.answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default Help;