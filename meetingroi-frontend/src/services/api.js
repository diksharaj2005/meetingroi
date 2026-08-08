// API service for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API_URL:', API_URL); // Debug log to verify the URL

// Helper to get token
export const getToken = () => localStorage.getItem('token');

// Helper to set token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper to get user
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper to set user
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper to clear auth
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// API request wrapper with auth
const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Auth APIs
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const getCurrentUser = async () => {
  return await authFetch('/auth/me');
};

// Meeting APIs
export const getMeetings = async () => {
  return await authFetch('/meetings');
};

export const createMeeting = async (meetingData) => {
  return await authFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
};

export const updateMeeting = async (id, meetingData) => {
  return await authFetch(`/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(meetingData),
  });
};

export const deleteMeeting = async (id) => {
  return await authFetch(`/meetings/${id}`, {
    method: 'DELETE',
  });
};

export const getMeetingStats = async () => {
  return await authFetch('/meetings/stats/summary');
};

// Google Calendar APIs
export const getAuthUrl = async () => {
  try {
    const token = getToken();
    console.log('Getting auth URL with token:', !!token);
    
    const response = await fetch(`${API_URL}/calendar/auth-url`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    const data = await response.json();
    console.log('Auth URL response:', data);
    return data;
  } catch (error) {
    console.error('GetAuthUrl error:', error);
    return { success: false, message: error.message };
  }
};

export const syncCalendar = async () => {
  try {
    const token = getToken();
    console.log('Syncing calendar with token:', !!token);
    
    const response = await fetch(`${API_URL}/calendar/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Sync response:', data);
    return data;
  } catch (error) {
    console.error('SyncCalendar error:', error);
    return { success: false, message: error.message, synced: 0 };
  }
};

// Get environment config
export const getConfig = () => ({
  appName: import.meta.env.VITE_APP_NAME || 'MeetingROI',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enableAI: import.meta.env.VITE_ENABLE_AI === 'true',
  enablePowerBI: import.meta.env.VITE_ENABLE_POWERBI === 'false',
  apiUrl: API_URL,
});

// Default export
export default {
  register,
  login,
  getCurrentUser,
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingStats,
  setToken,
  setUser,
  clearAuth,
  getUser,
  getToken,
  getConfig,
  getAuthUrl,
  syncCalendar,
};