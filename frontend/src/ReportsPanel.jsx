import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Download, DoorOpen, Users, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import fetchData from './DAL/FetchData'; 

// --- SECURITY UTILITY: Prevent CSV Injection ---
const sanitizeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    
    let str = String(value);
    
    // 1. Escape internal double quotes
    str = str.replace(/"/g, '""');
    
    // 2. Prevent Excel Formula Injection
    if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
    }
    
    return `"${str}"`;
};

function ReportsPanel({ onGoBack }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadReportData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchData.getAllBookings(); 
                
                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format received from server.");
                }
                
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch reporting data", error);
                setError("Unable to load booking analytics. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };
        loadReportData();
    }, []);

    // --- TREND CALCULATIONS ---
    const trends = useMemo(() => {
        if (!bookings.length) return { topRooms: [], topUsers: [], peakTimes: [] };

        const roomCounts = {};
        const userCounts = {};
        const timeCounts = {};

        bookings.forEach(b => {
            if (!b) return;

            const roomName = b.Room?.RoomName || b.RoomName || 'Unknown Room';
            roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;

            const userName = b.User ? `${b.User.Firstname || ''} ${b.User.Surname || ''}`.trim() : b.UserName || 'Unknown User';
            const finalUserName = userName || 'Unknown User';
            userCounts[finalUserName] = (userCounts[finalUserName] || 0) + 1;

            if (b.BookingStartTime) {
                const hour = b.BookingStartTime.substring(0, 2) + ":00";
                timeCounts[hour] = (timeCounts[hour] || 0) + 1;
            }
        });

        const getTop5 = (obj) => Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            topRooms: getTop5(roomCounts),
            topUsers: getTop5(userCounts),
            peakTimes: getTop5(timeCounts).sort((a, b) => a[0].localeCompare(b[0]))
        };
    }, [bookings]);

    // --- SECURE CSV EXPORT FUNCTION ---
    const handleExportCSV = () => {
        if (!bookings.length) return;

        try {
            const headers = ['Booking ID', 'Room', 'User', 'Title', 'Date', 'Start Time', 'End Time', 'Status'];
            
            const rows = bookings.map(b => {
                const roomName = b.Room?.RoomName || b.RoomName || '';
                const userName = b.User ? `${b.User.Firstname || ''} ${b.User.Surname || ''}`.trim() : b.UserName || '';
                
                return [
                    sanitizeCSV(b.BookingID),
                    sanitizeCSV(roomName),
                    sanitizeCSV(userName),
                    sanitizeCSV(b.Title),
                    sanitizeCSV(b.BookingDate),
                    sanitizeCSV(b.BookingStartTime),
                    sanitizeCSV(b.BookingEndTime),
                    sanitizeCSV('Confirmed')
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.setAttribute('download', `booking_reports_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("An error occurred while generating the CSV. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm font-medium">Analyzing booking data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in">
                <AlertCircle className="text-red-600 mt-0.5 shrink-0" />
                <div>
                    <h3 className="text-red-800 font-bold">Data Load Failed</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Navigation Header */}
            {onGoBack && (
                <button
                    onClick={onGoBack}
                    className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
                >
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm">
                        <ArrowLeft size={16} />
                    </div>
                    Return to Admin Menu
                </button>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" /> Booking Analytics
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Based on {bookings.length} total bookings across the organization.</p>
                </div>
                
                <button 
                    onClick={handleExportCSV}
                    disabled={bookings.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center text-slate-400">
                    <BarChart3 size={48} className="mb-4 opacity-20" />
                    <p className="font-medium italic">No booking data available to analyze.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Rooms */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <DoorOpen size={16} className="text-indigo-500" /> Most Popular Rooms
                        </h3>
                        <div className="space-y-3">
                            {trends.topRooms.map(([name, count], i) => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2 truncate">
                                        <span className="text-xs text-slate-400 shrink-0">#{i + 1}</span> 
                                        <span className="truncate">{name}</span>
                                    </span>
                                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md shrink-0 ml-2">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Users */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <Users size={16} className="text-emerald-500" /> Top Users
                        </h3>
                        <div className="space-y-3">
                            {trends.topUsers.map(([name, count], i) => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700 truncate">{name}</span>
                                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md shrink-0 ml-2">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Peak Times */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-amber-500" /> Peak Usage Times
                        </h3>
                        <div className="space-y-3">
                            {trends.peakTimes.map(([time, count]) => (
                                <div key={time} className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">{time}</span>
                                    <div className="flex items-center gap-2 w-1/2 justify-end">
                                        <div className="h-1.5 bg-amber-200 rounded-full w-full max-w-[4rem] overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full" 
                                                style={{ width: `${(count / trends.peakTimes[0][1]) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-amber-700 w-4 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPanel;