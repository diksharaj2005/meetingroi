import React, { useState } from 'react';
import { Icon } from './Icons';
import { getMeetings } from '../services/api';
import toast from 'react-hot-toast';

const PowerBIExport = () => {
  const [exporting, setExporting] = useState(false);

  const generateCSV = (meetings) => {
    const headers = ['Title', 'Start Time', 'End Time', 'Duration (min)', 'Attendees', 'Cost ($)', 'ROI (%)', 'Priority', 'Status'];
    const rows = meetings.map(m => [
      m.title,
      new Date(m.startTime).toLocaleString(),
      new Date(m.endTime).toLocaleString(),
      Math.round((new Date(m.endTime) - new Date(m.startTime)) / 60000),
      m.attendeeCount,
      parseFloat(m.cost),
      parseFloat(m.roi),
      m.priority,
      m.status,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meetingroi_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await getMeetings();
      if (response.success && response.meetings.length > 0) {
        generateCSV(response.meetings);
        toast.success(`Exported ${response.meetings.length} meetings to CSV for PowerBI`);
      } else {
        toast.error('No meetings to export');
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md transition disabled:opacity-50">
      {exporting ? <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div> : <Icon name="download" size={16} />}
      Export to PowerBI
    </button>
  );
};

export default PowerBIExport;