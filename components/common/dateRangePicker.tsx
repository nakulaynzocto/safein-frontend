"use client"

import { useRef, useState, useEffect, useMemo } from "react";
// Always use ISO yyyy-mm-dd for url/localStorage
import { Calendar as CalendarIcon, X as XIcon } from "lucide-react";

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const PREDEFINED_RANGES = [
    'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days',
    'This Month', 'Last Month', 'Last 1 Year', 'All'
];

interface DateRange { startDate: Date | null; endDate: Date | null }
interface DateRangePickerProps { onDateRangeChange?: (v: { startDate: string | null; endDate: string | null }) => void }

const DateRangePicker = ({ onDateRangeChange }: DateRangePickerProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [range, setRangeDates] = useState<DateRange>({ startDate: null, endDate: null });
    const [tempRange, setTempRange] = useState<DateRange>({ startDate: null, endDate: null });
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const today = new Date();
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    const [currentView, setCurrentView] = useState({
        month: today.getMonth(),
        year: today.getFullYear()
    });
    const [nextView, setNextView] = useState({
        month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
        year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear()
    });

    const displayRange = useMemo(() => {
        const { startDate, endDate } = range;
        return startDate && endDate ? `${toISO(startDate)} - ${toISO(endDate)}` : '';
    }, [range]);

    const generateCalendarDays = (year: number, month: number) => {
        const days: (Date | null)[] = [];
        const total = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));

        return days;
    };

    const currentMonthDays = useMemo(() => generateCalendarDays(currentView.year, currentView.month), [currentView]);
    const nextMonthDays = useMemo(() => generateCalendarDays(nextView.year, nextView.month), [nextView]);

    const updateCalendarViews = (direction: 'prev' | 'next') => {
        const adjust = (view: { month: number; year: number }, diff: number) => {
            const newMonth = view.month + diff;
            return {
                month: (newMonth + 12) % 12,
                year: view.year + Math.floor((view.month + diff) / 12)
            };
        };

        const delta = direction === 'prev' ? -1 : 1;
        setCurrentView((prev) => adjust(prev, delta));
        setNextView((prev) => adjust(prev, delta));
    };

    const applySelection = () => {
        if (!tempRange.startDate || !tempRange.endDate) return;

        setRangeDates(tempRange);
        
        // Store in localStorage
        localStorage.setItem('dateRange', JSON.stringify({
          startDate: toISO(tempRange.startDate),
          endDate: toISO(tempRange.endDate),
        }))

        onDateRangeChange?.({ startDate: toISO(tempRange.startDate), endDate: toISO(tempRange.endDate) });
        setIsOpen(false);
    };

    const cancelSelection = () => {
        setTempRange(range);
        setIsOpen(false);
    };

    const handleDateClick = (date: Date) => {
        const { startDate, endDate } = tempRange;
        if (!startDate || (startDate && endDate)) {
            setTempRange({ startDate: date, endDate: null });
        } else if (date < startDate) {
            setTempRange({ startDate: date, endDate: startDate });
        } else {
            setTempRange({ ...tempRange, endDate: date });
        }
    };

    const isInRange = (date: Date) => {
        const { startDate, endDate } = tempRange;
        return startDate && endDate && date >= startDate && date <= endDate;
    };

    const isStartOrEnd = (date: Date) => {
        const { startDate, endDate } = tempRange;
        return (startDate && startDate.getTime() === date.getTime()) || (endDate && endDate.getTime() === date.getTime());
    };

    const isInHoverRange = (date: Date) => {
        const { startDate, endDate } = tempRange;
        if (!startDate || !hoverDate || endDate) return false;
        return (date >= startDate && date <= hoverDate) || (date <= startDate && date >= hoverDate);
    };

    const handleRangeSelect = (rangeName: string) => {
        let start: Date | null, end: Date | null;
        switch (rangeName) {
            case 'Today': start = end = new Date(); break;
            case 'Yesterday': start = new Date(today); start.setDate(today.getDate() - 1); end = new Date(start); break;
            case 'Last 7 Days': start = new Date(today); start.setDate(today.getDate() - 6); end = today; break;
            case 'Last 30 Days': start = new Date(today); start.setDate(today.getDate() - 29); end = today; break;
            case 'This Month': start = new Date(today.getFullYear(), today.getMonth(), 1); end = new Date(today.getFullYear(), today.getMonth() + 1, 0); break;
            case 'Last Month': start = new Date(today.getFullYear(), today.getMonth() - 1, 1); end = new Date(today.getFullYear(), today.getMonth(), 0); break;
            case 'Last 1 Year': start = new Date(today); start.setFullYear(today.getFullYear() - 1); end = today; break;
            case 'All': 
                setRangeDates({ startDate: null, endDate: null }); 
                setTempRange({ startDate: null, endDate: null }); 
                setIsOpen(false); 
                
                // Store in localStorage
                localStorage.setItem('dateRange', JSON.stringify({ startDate: null, endDate: null }));
                
                onDateRangeChange?.({ startDate: null, endDate: null }); 
                return;
            default: start = end = new Date();
        }

        setRangeDates({ startDate: start, endDate: end });
        setTempRange({ startDate: start, endDate: end });
        setIsOpen(false);
        
        // Store in localStorage
        localStorage.setItem('dateRange', JSON.stringify({ startDate: toISO(start!), endDate: toISO(end!) }))
        
        onDateRangeChange?.({ startDate: toISO(start!), endDate: toISO(end!) });
    };

    // Load initial state from localStorage
    useEffect(() => {
        const raw = localStorage.getItem('dateRange');
        const saved = raw ? JSON.parse(raw) : null;
        const initialStart = saved?.startDate ? new Date(saved.startDate) : null;
        const initialEnd = saved?.endDate ? new Date(saved.endDate) : null;
        setRangeDates({ startDate: initialStart, endDate: initialEnd });
        setTempRange({ startDate: initialStart, endDate: initialEnd });
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderCalendar = (days: (Date | null)[], month: number) => (
        <div className="date-range-calendar" style={{ width: 220, minWidth: 220 }}>
            <div
                className="date-range-calendar-weekdays"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}
            >
                {WEEKDAYS.map((day) => (
                    <div key={day} className="date-range-calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>
            <div
                className="date-range-calendar-days"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
            >
                {days.map((date: Date | null, i: number) => (
                    <div
                        key={i}
                        className={`date-range-calendar-day ${!date ? 'cursor-default' : ''} ${date && isInRange(date) ? 'in-range' : ''} ${date && isStartOrEnd(date) ? 'start-end' : ''} ${date && isInHoverRange(date) ? 'hover-range' : ''} ${date && date.getMonth() !== month ? 'other-month' : ''}`}
                        onClick={() => date && handleDateClick(date)}
                        onMouseEnter={() => date && setHoverDate(date)}
                        style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {date?.getDate() ?? ''}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="date-range-picker-container" ref={containerRef}>
            <div
                className="date-range-picker-trigger flex items-center gap-1 whitespace-nowrap border border-dashed border-gray-300 rounded-full px-2 py-1 bg-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {range.startDate && range.endDate ? (
                    <span
                        className="text-gray-500 hover:text-red-600 cursor-pointer text-lg font-bold"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRangeDates({ startDate: null, endDate: null });
                            setTempRange({ startDate: null, endDate: null });
                            
                            // Store in localStorage
                            localStorage.setItem(
                                'dateRange',
                                JSON.stringify({ startDate: null, endDate: null })
                            );
                            
                            onDateRangeChange?.({ startDate: null, endDate: null });
                        }}
                    >
                        <XIcon className="h-4 w-4" />
                    </span>
                ) : <CalendarIcon className="h-4 w-4" />}
                <span className="text-default">
                    {displayRange || 'Select date range'}
                </span>
            </div>

            {isOpen && (
                <div
                    className="date-range-picker-dropdown absolute z-50 mt-2 flex bg-white border border-gray-300 rounded-md shadow-lg"
                    style={{ right: 0, left: 'auto' }}
                >
                    <div className="date-range-presets w-36 py-4 border-r border-gray-300 bg-white">
                        {PREDEFINED_RANGES.map(range => (
                            <div
                                key={range}
                                className="date-range-preset-item px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleRangeSelect(range)}
                            >
                                {range}
                            </div>
                        ))}
                    </div>

                    <div className="date-range-calendar-container p-4 flex flex-col">
                        <div className="date-range-calendar-header flex items-center justify-between mb-2 px-2">
                            <button className="date-range-calendar-nav-btn" onClick={() => updateCalendarViews('prev')}>&lt;</button>
                            <div className="date-range-calendar-month-title font-semibold text-sm text-gray-700">
                                {new Date(currentView.year, currentView.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="date-range-calendar-month-title font-semibold text-sm text-gray-700">
                                {new Date(nextView.year, nextView.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                            <button className="date-range-calendar-nav-btn" onClick={() => updateCalendarViews('next')}>&gt;</button>
                        </div>

                        <div className="date-range-calendars flex gap-5 sm:flex-row flex-col">
                            {renderCalendar(currentMonthDays, currentView.month)}
                            {renderCalendar(nextMonthDays, nextView.month)}
                        </div>

                        <div className="date-range-footer flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                            <div className="date-range-selected-text text-sm text-gray-500">
                                {tempRange.startDate && tempRange.endDate && `${toISO(tempRange.startDate)} - ${toISO(tempRange.endDate)}`}
                            </div>
                            <div className="date-range-footer-buttons flex gap-2">
                                <button className="date-range-btn date-range-btn-cancel px-3 py-1 text-sm border border-gray-300 rounded" onClick={cancelSelection}>Cancel</button>
                                <button
                                    className="date-range-btn date-range-btn-apply px-3 py-1 text-sm border rounded bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    onClick={applySelection}
                                    disabled={!tempRange.startDate || !tempRange.endDate}
                                >Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;