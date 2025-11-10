"use client"

import { useRef, useState, useEffect, useMemo } from "react";
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
        for (let d = 1; d <= total; d++) {
            const date = new Date(year, month, d);
            date.setHours(0, 0, 0, 0); // Normalize to midnight
            days.push(date);
        }

        return days;
    };

    const currentMonthDays = useMemo(() => generateCalendarDays(currentView.year, currentView.month), [currentView]);
    const nextMonthDays = useMemo(() => generateCalendarDays(nextView.year, nextView.month), [nextView]);

    const updateCalendarViews = (direction: 'prev' | 'next') => {
        const adjust = (view: { month: number; year: number }, diff: number) => {
            const newMonth = view.month + diff;
            return {
                month: (newMonth + 12) % 12,
                year: view.year + Math.floor((newMonth + 12) / 12) - 1
            };
        };

        const delta = direction === 'prev' ? -1 : 1;
        setCurrentView((prev) => adjust(prev, delta));
        setNextView((prev) => adjust(prev, delta));
    };

    const applySelection = () => {
        if (!tempRange.startDate || !tempRange.endDate) return;

        setRangeDates(tempRange);
        
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

    // Normalize date to midnight for proper comparison
    const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
    };

    const handleDateClick = (date: Date) => {
        const normalizedDate = normalizeDate(date);
        const { startDate, endDate } = tempRange;
        
        if (!startDate || (startDate && endDate)) {
            setTempRange({ startDate: normalizedDate, endDate: null });
            setHoverDate(null);
        } else {
            const normalizedStart = normalizeDate(startDate);
            if (normalizedDate < normalizedStart) {
                setTempRange({ startDate: normalizedDate, endDate: normalizedStart });
            } else {
                setTempRange({ startDate: normalizedStart, endDate: normalizedDate });
            }
        }
    };

    const isInRange = (date: Date) => {
        const { startDate, endDate } = tempRange;
        if (!startDate || !endDate) return false;
        const normalizedDate = normalizeDate(date);
        const normalizedStart = normalizeDate(startDate);
        const normalizedEnd = normalizeDate(endDate);
        const inRange = normalizedDate.getTime() > normalizedStart.getTime() && 
                        normalizedDate.getTime() < normalizedEnd.getTime();
        return inRange;
    };

    const isStartOrEnd = (date: Date) => {
        const { startDate, endDate } = tempRange;
        if (!startDate && !endDate) return false;
        const normalizedDate = normalizeDate(date);
        const normalizedStart = startDate ? normalizeDate(startDate) : null;
        const normalizedEnd = endDate ? normalizeDate(endDate) : null;
        const isStart = normalizedStart && normalizedStart.getTime() === normalizedDate.getTime();
        const isEnd = normalizedEnd && normalizedEnd.getTime() === normalizedDate.getTime();
        return isStart || isEnd;
    };

    const isInHoverRange = (date: Date) => {
        const { startDate, endDate } = tempRange;
        if (!startDate || !hoverDate || endDate) return false;
        const normalizedDate = normalizeDate(date);
        const normalizedStart = normalizeDate(startDate);
        const normalizedHover = normalizeDate(hoverDate);
        const min = normalizedStart.getTime() < normalizedHover.getTime() ? normalizedStart : normalizedHover;
        const max = normalizedStart.getTime() > normalizedHover.getTime() ? normalizedStart : normalizedHover;
        return normalizedDate.getTime() > min.getTime() && normalizedDate.getTime() < max.getTime();
    };

    const handleRangeSelect = (rangeName: string) => {
        let start: Date | null, end: Date | null;
        const normalizedToday = normalizeDate(today);
        
        switch (rangeName) {
            case 'Today': 
                start = end = new Date(normalizedToday);
                break;
            case 'Yesterday': 
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 1);
                end = new Date(start);
                break;
            case 'Last 7 Days': 
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 6);
                end = new Date(normalizedToday);
                break;
            case 'Last 30 Days': 
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 29);
                end = new Date(normalizedToday);
                break;
            case 'This Month': 
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                normalizeDate(start);
                normalizeDate(end);
                break;
            case 'Last Month': 
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                normalizeDate(start);
                normalizeDate(end);
                break;
            case 'Last 1 Year': 
                start = new Date(normalizedToday);
                start.setFullYear(start.getFullYear() - 1);
                end = new Date(normalizedToday);
                break;
            case 'All': 
                setRangeDates({ startDate: null, endDate: null }); 
                setTempRange({ startDate: null, endDate: null }); 
                setIsOpen(false); 
                localStorage.setItem('dateRange', JSON.stringify({ startDate: null, endDate: null }));
                onDateRangeChange?.({ startDate: null, endDate: null }); 
                return;
            default: 
                start = end = new Date(normalizedToday);
        }

        if (start && end) {
            normalizeDate(start);
            normalizeDate(end);
            setRangeDates({ startDate: start, endDate: end });
            setTempRange({ startDate: start, endDate: end });
            setIsOpen(false);
            
            localStorage.setItem('dateRange', JSON.stringify({ startDate: toISO(start!), endDate: toISO(end!) }))
            onDateRangeChange?.({ startDate: toISO(start!), endDate: toISO(end!) });
        }
    };

    // Load initial state from localStorage
    useEffect(() => {
        const raw = localStorage.getItem('dateRange');
        const saved = raw ? JSON.parse(raw) : null;
        const initialStart = saved?.startDate ? normalizeDate(new Date(saved.startDate)) : null;
        const initialEnd = saved?.endDate ? normalizeDate(new Date(saved.endDate)) : null;
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
            <div className="date-range-calendar-weekdays" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
                {WEEKDAYS.map((day) => (
                    <div key={day} className="date-range-calendar-weekday">{day}</div>
                ))}
            </div>
            <div className="date-range-calendar-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {days.map((date: Date | null, i: number) => {
                    if (!date) {
                        return <div key={i} className="date-range-calendar-day" style={{ height: 30 }}></div>;
                    }
                    
                    const isOtherMonth = date.getMonth() !== month;
                    const isInRangeCheck = isInRange(date);
                    const isStartOrEndCheck = isStartOrEnd(date);
                    const isInHoverRangeCheck = isInHoverRange(date);
                    
                    // Build className and inline styles
                    let className = 'date-range-calendar-day';
                    let inlineStyles: React.CSSProperties = { 
                        height: 30, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer'
                    };
                    
                    if (isOtherMonth) {
                        className += ' other-month';
                        inlineStyles.color = '#d1d5db';
                    }
                    
                    if (isStartOrEndCheck) {
                        className += ' start-end';
                        inlineStyles.backgroundColor = '#2563eb';
                        inlineStyles.color = 'white';
                        inlineStyles.border = '2px solid #2563eb';
                        inlineStyles.borderRadius = '50%';
                        inlineStyles.fontWeight = '600';
                    } else if (isInRangeCheck) {
                        className += ' in-range';
                        inlineStyles.backgroundColor = 'rgba(37, 99, 235, 0.15)';
                        inlineStyles.color = '#1f2937';
                    } else if (isInHoverRangeCheck) {
                        className += ' hover-range';
                        inlineStyles.backgroundColor = 'rgba(37, 99, 235, 0.2)';
                        inlineStyles.color = '#111827';
                    }
                    
                    return (
                        <div
                            key={i}
                            className={className}
                            onClick={() => handleDateClick(date)}
                            onMouseEnter={() => setHoverDate(date)}
                            style={inlineStyles}
                            data-date={date.toISOString().slice(0, 10)}
                            data-class={className}
                        >
                            {date.getDate()}
                        </div>
                    );
                })}
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
                            localStorage.setItem('dateRange', JSON.stringify({ startDate: null, endDate: null }));
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
