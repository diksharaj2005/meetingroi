import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { motion } from 'framer-motion';
import { getAuthUrl, syncCalendar } from '../services/api';
import toast from 'react-hot-toast';

const GoogleCalendarSync = ({ onSyncComplete }) => {
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState(0);
  const syncInProgress = useRef(false);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = localStorage.getItem('google_connected') === 'true';
      const syncedCount = localStorage.getItem('google_synced_count') || 0;
      setIsConnected(connected);
      setLastSyncCount(parseInt(syncedCount));
    };
    checkConnection();
  }, []);

  const handleGoogleLogin = async () => {
    toast.info('🚀 Google Calendar sync is coming soon!', {
      duration: 4000,
      icon: '📅',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a',
        borderRadius: '12px'
      }
    });
    // Uncomment this when ready to enable
    // try {
    //   const response = await getAuthUrl();
    //   if (response.success && response.url) {
    //     window.location.href = response.url;
    //   } else {
    //     toast.error('Failed to get Google auth URL');
    //   }
    // } catch (error) {
    //   console.error('Auth error:', error);
    //   toast.error('Failed to connect to Google');
    // }
  };

  const handleSync = async () => {
    toast.info('🚀 Google Calendar sync is coming soon!', {
      duration: 4000,
      icon: '📅',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a',
        borderRadius: '12px'
      }
    });
    // Uncomment this when ready to enable
    // if (syncInProgress.current || syncing) {
    //   return;
    // }
    // syncInProgress.current = true;
    // setSyncing(true);
    // try {
    //   const response = await syncCalendar();
    //   if (response.success) {
    //     if (response.synced > 0) {
    //       toast.success(`✅ Synced ${response.synced} meeting${response.synced > 1 ? 's' : ''} from Google Calendar!`);
    //       setLastSyncCount(response.synced);
    //       localStorage.setItem('google_synced_count', response.synced);
    //     } else {
    //       toast.success('📅 No new meetings found in Google Calendar');
    //     }
    //     setIsConnected(true);
    //     localStorage.setItem('google_connected', 'true');
    //     if (onSyncComplete && typeof onSyncComplete === 'function') {
    //       onSyncComplete();
    //     }
    //   } else {
    //     toast.error(response.message || 'Sync failed');
    //   }
    // } catch (error) {
    //   console.error('Sync error:', error);
    //   toast.error('Sync failed. Please try again.');
    // } finally {
    //   setSyncing(false);
    //   setTimeout(() => {
    //     syncInProgress.current = false;
    //   }, 1000);
    // }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Icon name="calendar" size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">Google Calendar</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
              <Icon name="sparkles" size={10} />
              Coming Soon
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sync your Google Calendar meetings automatically</p>
        </div>
        {isConnected && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Connected
          </span>
        )}
        {lastSyncCount > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Last sync: {lastSyncCount} meeting{lastSyncCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {!isConnected ? (
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Connect Google Account</span>
          <span className="text-xs text-amber-500 dark:text-amber-400 ml-1">(Coming Soon)</span>
        </button>
      ) : (
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            syncing 
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-md'
          }`}
        >
          {syncing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-500 dark:border-slate-400 rounded-full animate-spin border-t-transparent"></div>
              <span className="text-sm font-medium">Syncing...</span>
            </>
          ) : (
            <>
              <Icon name="refresh" size={16} className="text-white" />
              <span className="text-sm font-medium">Sync Now</span>
            </>
          )}
        </button>
      )}
      
      {/* Coming Soon Feature List */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Icon name="check" size={12} className="text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Auto Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="check" size={12} className="text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">One-Click Import</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="check" size={12} className="text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Cost Calculation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="clock" size={12} className="text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Real-time Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarSync;