import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '../components/Icons';
import { syncCalendar, getAuthUrl } from '../services/api';
import toast from 'react-hot-toast';

const Calendar = () => {
  const [searchParams] = useSearchParams();
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const hasAutoSynced = useRef(false);

  // Check for sync parameter on page load
  useEffect(() => {
    const syncParam = searchParams.get('sync');
    
    if (syncParam === 'success' && !hasAutoSynced.current) {
      setSyncStatus('success');
      toast.success('Google Calendar connected successfully!');
      hasAutoSynced.current = true;
      handleSync();
    } else if (syncParam === 'failed') {
      setSyncStatus('failed');
      toast.error('Failed to connect Google Calendar');
    }
  }, [searchParams]);

  const handleSync = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      const response = await syncCalendar();
      if (response.success) {
        setSyncedCount(response.synced || 0);
        if (response.synced > 0) {
          toast.success(`Synced ${response.synced} meeting${response.synced > 1 ? 's' : ''} from Google Calendar!`);
        } else {
          toast.success('No new meetings found in Google Calendar');
        }
      } else {
        toast.error(response.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      const response = await getAuthUrl();
      console.log('Auth URL response:', response);
      
      if (response.success && response.url) {
        // Redirect to Google OAuth page
        window.location.href = response.url;
      } else {
        toast.error(response.message || 'Failed to get authorization URL');
        setConnecting(false);
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to connect to Google Calendar');
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50">
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="calendar" size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Google Calendar Sync</h1>
            <p className="text-slate-500 mt-2">Connect your Google Calendar to import meetings</p>
          </div>

          {/* Sync Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center"
          >
            {syncStatus === 'success' ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="success" size={32} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connected Successfully!</h2>
                <p className="text-slate-500 mb-6">
                  Your Google Calendar is now connected to MeetingROI.
                </p>
                
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-md transition disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Icon name="refresh" size={18} />
                      Sync Now
                    </>
                  )}
                </button>
                
                {syncedCount > 0 && (
                  <p className="mt-4 text-sm text-green-600">
                    ✅ {syncedCount} meeting{syncedCount > 1 ? 's' : ''} synced from Google Calendar!
                  </p>
                )}
              </>
            ) : syncStatus === 'failed' ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="error" size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Failed</h2>
                <p className="text-slate-500 mb-6">
                  Could not connect to Google Calendar. Please try again.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-md transition"
                >
                  {connecting ? 'Connecting...' : 'Try Again'}
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="sparkles" size={32} className="text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Google Calendar</h2>
                <p className="text-slate-500 mb-6">
                  Sync your Google Calendar meetings to automatically track costs and ROI.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-md transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {connecting ? 'Connecting...' : 'Connect Google Account'}
                </button>
              </>
            )}
          </motion.div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon="refresh"
              title="Auto Sync"
              description="Meetings sync automatically from your Google Calendar"
            />
            <FeatureCard
              icon="brain"
              title="AI Analysis"
              description="Get ROI predictions and optimization suggestions"
            />
            <FeatureCard
              icon="chart"
              title="Cost Tracking"
              description="Automatic cost calculation for every meeting"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
      <Icon name={icon} size={18} className="text-amber-600" />
    </div>
    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);

export default Calendar;