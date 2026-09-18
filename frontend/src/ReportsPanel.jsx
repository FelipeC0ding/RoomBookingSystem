import React, { useState, useEffect, useMemo } from 'react';
import { 
    ArrowLeft, Download, Calendar, Clock, DoorOpen, Users, 
    Search, ArrowUpDown, CheckCircle2, AlertCircle, BarChart3,
    Layers, TrendingUp, User
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import fetchData from './DAL/FetchData'; 
import { validateDate, validateDateRange, validateSearchTerm } from './lib/validation.js';

// --- SECURITY: CSV Formula Injection Prevention ---
const sanitizeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    let str = String(value).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
    }
    return `"${str}"`;
};

// --- HELPER: Calculate duration in decimal hours ---
const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    return duration > 0 ? duration : 0;
};

const formatDateKey = (d) => d.toISOString().split('T')[0];

function ReportsPanel({ onGoBack }) {
    const [allBookings, setAllBookings] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Period Preset & Date Filter State
    const [preset, setPreset] = useState('30d');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Room Table Search & Sorting
    const [roomSearch, setRoomSearch] = useState('');
    const [sortField, setSortField] = useState('hours'); // 'name' | 'bookings' | 'hours' | 'capacity'
    const [sortDirection, setSortDirection] = useState('desc');

    // Date range validation
    const dateRangeError = useMemo(() => {
        if (startDate && endDate) {
            const rangeVal = validateDateRange(startDate, endDate);
            return rangeVal.isValid ? null : rangeVal.error;
        }
        if (startDate) {
            const dateVal = validateDate(startDate, 'Start date');
            return dateVal.isValid ? null : dateVal.error;
        }
        if (endDate) {
            const dateVal = validateDate(endDate, 'End date');
            return dateVal.isValid ? null : dateVal.error;
        }
        return null;
    }, [startDate, endDate]);

    // Initial load: fetch rooms and bookings
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [roomsData, bookingsData] = await Promise.all([
                    fetchData.getRooms(),
                    fetchData.getAllBookings()
                ]);

                setAllRooms(Array.isArray(roomsData) ? roomsData : []);
                setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);

                // Default to Last 30 Days
                const today = new Date();
                const past30 = new Date(today);
                past30.setDate(today.getDate() - 30);
                setEndDate(formatDateKey(today));
                setStartDate(formatDateKey(past30));

            } catch (err) {
                console.error("Failed to fetch analytics data", err);
                setError("Unable to load booking records. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Handle Preset Selection
    const handlePresetChange = (newPreset) => {
        setPreset(newPreset);
        const today = new Date();
        const todayStr = formatDateKey(today);

        if (newPreset === '7d') {
            const start = new Date(today);
            start.setDate(today.getDate() - 7);
            setStartDate(formatDateKey(start));
            setEndDate(todayStr);
        } else if (newPreset === '30d') {
            const start = new Date(today);
            start.setDate(today.getDate() - 30);
            setStartDate(formatDateKey(start));
            setEndDate(todayStr);
        } else if (newPreset === '90d') {
            const start = new Date(today);
            start.setDate(today.getDate() - 90);
            setStartDate(formatDateKey(start));
            setEndDate(todayStr);
        } else if (newPreset === 'all') {
            setStartDate('');
            setEndDate('');
        } else if (newPreset === 'custom') {
            // Keep current start/end dates
        }
    };

    // Filter Bookings by Date Range
    const filteredBookings = useMemo(() => {
        if (dateRangeError) return [];
        return allBookings.filter(b => {
            if (!b.BookingDate) return false;
            const bDate = b.BookingDate.split('T')[0];
            if (startDate && bDate < startDate) return false;
            if (endDate && bDate > endDate) return false;
            return true;
        });
    }, [allBookings, startDate, endDate, dateRangeError]);

    // Aggregate Room Utilization
    const roomUtilization = useMemo(() => {
        const statsMap = new Map();

        // 1. Populate all rooms from catalog so unused rooms are accurately tracked
        allRooms.forEach(room => {
            const name = room.RoomName || 'Unnamed Room';
            statsMap.set(name, {
                id: room.RoomID || room.id,
                name: name,
                capacity: room.Capacity || 0,
                location: room.Location || '',
                bookingsCount: 0,
                totalHours: 0
            });
        });

        // 2. Accumulate bookings in current filtered period
        filteredBookings.forEach(b => {
            const name = b.Room?.RoomName || b.RoomName || 'Unknown Room';
            const duration = calculateDuration(b.BookingStartTime, b.BookingEndTime);

            if (!statsMap.has(name)) {
                statsMap.set(name, {
                    id: b.RoomID || name,
                    name: name,
                    capacity: b.Room?.Capacity || b.Capacity || 0,
                    location: '',
                    bookingsCount: 0,
                    totalHours: 0
                });
            }

            const roomStat = statsMap.get(name);
            roomStat.bookingsCount += 1;
            roomStat.totalHours += duration;
        });

        const totalHoursSum = Array.from(statsMap.values()).reduce((sum, r) => sum + r.totalHours, 0);

        return Array.from(statsMap.values()).map(r => ({
            ...r,
            shareOfUsage: totalHoursSum > 0 ? (r.totalHours / totalHoursSum) * 100 : 0
        }));
    }, [allRooms, filteredBookings]);

    // Top Summary KPI Metrics
    const kpi = useMemo(() => {
        const totalBookings = filteredBookings.length;
        const totalHours = filteredBookings.reduce((acc, b) => acc + calculateDuration(b.BookingStartTime, b.BookingEndTime), 0);

        const activeRoomsCount = roomUtilization.filter(r => r.bookingsCount > 0).length;
        const totalRoomsCount = allRooms.length || roomUtilization.length;
        const activePercentage = totalRoomsCount > 0 ? Math.round((activeRoomsCount / totalRoomsCount) * 100) : 0;

        const sortedByHours = [...roomUtilization].sort((a, b) => b.totalHours - a.totalHours);
        const topRoom = sortedByHours.length > 0 && sortedByHours[0].bookingsCount > 0 ? sortedByHours[0] : null;

        const avgDuration = totalBookings > 0 ? (totalHours / totalBookings).toFixed(1) : '0.0';

        return {
            totalBookings,
            totalHours: totalHours.toFixed(1),
            activeRoomsCount,
            totalRoomsCount,
            activePercentage,
            topRoomName: topRoom ? topRoom.name : 'None',
            topRoomHours: topRoom ? topRoom.totalHours.toFixed(1) : '0.0',
            avgDuration
        };
    }, [filteredBookings, roomUtilization, allRooms]);

    // Peak Hours Chart Data (8:00 to 18:00 standard day)
    const hourlyData = useMemo(() => {
        const hours = {};
        for (let h = 8; h <= 18; h++) {
            const label = `${String(h).padStart(2, '0')}:00`;
            hours[label] = 0;
        }

        filteredBookings.forEach(b => {
            if (!b.BookingStartTime) return;
            const h = parseInt(b.BookingStartTime.split(':')[0], 10);
            const label = `${String(h).padStart(2, '0')}:00`;
            if (hours[label] !== undefined) {
                hours[label] += 1;
            } else if (h >= 0 && h < 24) {
                hours[label] = (hours[label] || 0) + 1;
            }
        });

        return Object.entries(hours)
            .map(([time, count]) => ({ time, count }))
            .sort((a, b) => parseInt(a.time, 10) - parseInt(b.time, 10));
    }, [filteredBookings]);

    // Day of Week Distribution Chart Data
    const dayOfWeekData = useMemo(() => {
        const days = [
            { day: 'Mon', count: 0 },
            { day: 'Tue', count: 0 },
            { day: 'Wed', count: 0 },
            { day: 'Thu', count: 0 },
            { day: 'Fri', count: 0 },
            { day: 'Sat', count: 0 },
            { day: 'Sun', count: 0 }
        ];

        filteredBookings.forEach(b => {
            if (!b.BookingDate) return;
            const d = new Date(b.BookingDate);
            const dayIdx = d.getDay(); // 0 is Sun, 1 is Mon
            const target = dayIdx === 0 ? days[6] : days[dayIdx - 1];
            if (target) target.count += 1;
        });

        return days;
    }, [filteredBookings]);

    // Top Organizers (Most Active Users)
    const topUsers = useMemo(() => {
        const userMap = new Map();

        filteredBookings.forEach(b => {
            const name = b.User ? `${b.User.Firstname || ''} ${b.User.Surname || ''}`.trim() : '';
            if (!name) return;

            const duration = calculateDuration(b.BookingStartTime, b.BookingEndTime);
            if (!userMap.has(name)) {
                userMap.set(name, { name, bookings: 0, hours: 0 });
            }
            const stat = userMap.get(name);
            stat.bookings += 1;
            stat.hours += duration;
        });

        return Array.from(userMap.values())
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);
    }, [filteredBookings]);

    // Filtered & Sorted Room Utilization Table Rows
    const displayRooms = useMemo(() => {
        const term = roomSearch.trim().toLowerCase();
        let list = roomUtilization.filter(r => 
            !term || r.name.toLowerCase().includes(term) || (r.location && r.location.toLowerCase().includes(term))
        );

        list.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (typeof valA === 'string') {
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        });

        return list;
    }, [roomUtilization, roomSearch, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'name' ? 'asc' : 'desc');
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        if (dateRangeError || !filteredBookings.length) return;

        try {
            const headers = ['Room', 'Capacity', 'User', 'Title', 'Date', 'Start Time', 'End Time', 'Duration (Hours)'];

            const rows = filteredBookings.map(b => {
                const roomName = b.Room?.RoomName || b.RoomName || '';
                const capacity = b.Room?.Capacity || b.Capacity || '';
                const userName = b.User ? `${b.User.Firstname || ''} ${b.User.Surname || ''}`.trim() : '';
                const duration = calculateDuration(b.BookingStartTime, b.BookingEndTime);

                return [
                    sanitizeCSV(roomName),
                    sanitizeCSV(capacity),
                    sanitizeCSV(userName),
                    sanitizeCSV(b.Title),
                    sanitizeCSV(b.BookingDate),
                    sanitizeCSV(b.BookingStartTime),
                    sanitizeCSV(b.BookingEndTime),
                    sanitizeCSV(duration.toFixed(2))
                ];
            });

            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            const dateLabel = startDate && endDate ? `${startDate}_to_${endDate}` : 'all_time';
            link.href = url;
            link.setAttribute('download', `room_booking_report_${dateLabel}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
            alert("An error occurred while generating the CSV export.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <p className="font-semibold text-sm">Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex justify-center">
                <div className="bg-white border border-red-200 rounded-2xl p-6 flex items-start gap-4 max-w-lg w-full shadow-sm">
                    <AlertCircle className="text-red-600 mt-0.5 shrink-0" size={20} />
                    <div>
                        <h3 className="text-slate-900 font-bold text-base">Error Loading Reports</h3>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{error}</p>
                        {onGoBack && (
                            <button
                                onClick={onGoBack}
                                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                                Back to Admin
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Back navigation */}
                {onGoBack && (
                    <div>
                        <button
                            onClick={onGoBack}
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm">
                                <ArrowLeft size={16} />
                            </div>
                            Back to Admin
                        </button>
                    </div>
                )}

                {/* Header & Controls Bar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Room Booking Reports</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Overview of room utilization, demand hours, and booking volume.</p>
                    </div>

                    {/* Period selector & Export */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Preset pills */}
                        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                            <button
                                onClick={() => handlePresetChange('7d')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    preset === '7d' 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                7 Days
                            </button>
                            <button
                                onClick={() => handlePresetChange('30d')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    preset === '30d' 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                30 Days
                            </button>
                            <button
                                onClick={() => handlePresetChange('90d')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    preset === '90d' 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                90 Days
                            </button>
                            <button
                                onClick={() => handlePresetChange('all')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    preset === 'all' 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                All Time
                            </button>
                            <button
                                onClick={() => setPreset('custom')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    preset === 'custom' 
                                        ? 'bg-white text-slate-900 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Custom
                            </button>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            disabled={filteredBookings.length === 0 || !!dateRangeError}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-sm"
                            title="Export current view to CSV"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Custom Date Inputs (only when Custom is active) */}
                {preset === 'custom' && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 ${
                                    dateRangeError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 ${
                                    dateRangeError ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </div>
                        {dateRangeError && (
                            <span className="text-xs text-red-600 font-semibold">{dateRangeError}</span>
                        )}
                    </div>
                )}

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Total Bookings */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bookings</span>
                            <Calendar size={18} className="text-slate-400" />
                        </div>
                        <div className="mt-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{kpi.totalBookings}</span>
                            <span className="block text-xs text-slate-500 mt-1">in selected period</span>
                        </div>
                    </div>

                    {/* 2. Total Hours */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hours</span>
                            <Clock size={18} className="text-slate-400" />
                        </div>
                        <div className="mt-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{kpi.totalHours}</span>
                            <span className="block text-xs text-slate-500 mt-1">{kpi.avgDuration} hrs avg per booking</span>
                        </div>
                    </div>

                    {/* 3. Room Utilization */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rooms</span>
                            <DoorOpen size={18} className="text-slate-400" />
                        </div>
                        <div className="mt-3">
                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                {kpi.activeRoomsCount}<span className="text-lg text-slate-400 font-bold"> / {kpi.totalRoomsCount}</span>
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">{kpi.activePercentage}% of rooms utilized</span>
                        </div>
                    </div>

                    {/* 4. Most Booked Room */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Busiest Room</span>
                            <TrendingUp size={18} className="text-slate-400" />
                        </div>
                        <div className="mt-3">
                            <span className="text-xl font-black text-slate-900 truncate block tracking-tight">
                                {kpi.topRoomName}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">
                                {kpi.topRoomHours} hrs booked
                            </span>
                        </div>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-500 shadow-sm">
                        <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-700">No bookings recorded for this period</h3>
                        <p className="text-xs text-slate-400 mt-1">Try switching to 'All Time' or adjusting the date range.</p>
                    </div>
                ) : (
                    <>
                        {/* Charts Section: Hourly Demand & Day Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Peak Hours Chart */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Demand by Time of Day</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Identifies peak hours and daily bottlenecks.</p>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="time" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fill: '#64748b' }} 
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }} 
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                                }}
                                            />
                                            <Bar dataKey="count" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Day of Week Breakdown */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Demand by Day of Week</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Shows which days have open capacity.</p>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis 
                                                dataKey="day" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fill: '#64748b' }} 
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }} 
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                                }}
                                            />
                                            <Bar dataKey="count" name="Bookings" fill="#475569" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Room Utilization Table & Most Active Organizers */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Room Utilization Table (2 columns on large screens) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Room Utilization</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Summary of hours booked per room.</p>
                                    </div>
                                    <div className="relative w-full sm:w-56">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={roomSearch}
                                            maxLength={50}
                                            placeholder="Search rooms..."
                                            onChange={(e) => {
                                                const val = validateSearchTerm(e.target.value, 50);
                                                if (val.isValid) setRoomSearch(val.value);
                                            }}
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                                <th 
                                                    className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Room
                                                        <ArrowUpDown size={12} className="text-slate-400" />
                                                    </div>
                                                </th>
                                                <th 
                                                    className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 select-none"
                                                    onClick={() => handleSort('capacity')}
                                                >
                                                    Capacity
                                                </th>
                                                <th 
                                                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                                                    onClick={() => handleSort('bookingsCount')}
                                                >
                                                    Bookings
                                                </th>
                                                <th 
                                                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                                                    onClick={() => handleSort('totalHours')}
                                                >
                                                    Hours
                                                </th>
                                                <th className="py-3 px-4 text-right">Share of Usage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {displayRooms.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                                                        No rooms match your search.
                                                    </td>
                                                </tr>
                                            ) : (
                                                displayRooms.map((room) => (
                                                    <tr key={room.name} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-4 font-bold text-slate-800">
                                                            {room.name}
                                                            {room.location && (
                                                                <span className="block font-normal text-[11px] text-slate-400">
                                                                    {room.location}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3 text-center text-slate-600 font-medium">
                                                            {room.capacity ? `${room.capacity}` : '—'}
                                                        </td>
                                                        <td className="py-3 px-3 text-right font-semibold text-slate-700">
                                                            {room.bookingsCount}
                                                        </td>
                                                        <td className="py-3 px-3 text-right font-black text-slate-900">
                                                            {room.totalHours.toFixed(1)} <span className="font-normal text-slate-400 text-[10px]">hrs</span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="bg-blue-600 h-full rounded-full" 
                                                                        style={{ width: `${Math.min(100, Math.round(room.shareOfUsage))}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-slate-600 min-w-[32px] text-right">
                                                                    {room.shareOfUsage.toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Organizers (Right Column) */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Organizers</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Staff with the most bookings in this period.</p>
                                    </div>

                                    {topUsers.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-6 text-center">No user bookings recorded.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topUsers.map((user, idx) => (
                                                <div key={user.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-800 truncate">
                                                            {user.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-xs font-black text-slate-900">{user.bookings}</span>
                                                        <span className="text-[10px] text-slate-400 ml-1">({user.hours.toFixed(1)}h)</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                                    <span>Data refreshed live from database</span>
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

export default ReportsPanel;