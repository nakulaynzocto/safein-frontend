"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PREDEFINED_RANGES = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Month",
    "Last 1 Year",
    "All",
];

interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}
interface DateRangePickerProps {
    onDateRangeChange?: (v: { startDate: string | null; endDate: string | null }) => void;
    initialValue?: { startDate: string | null; endDate: string | null };
    className?: string;
}

const DateRangePicker = ({ onDateRangeChange, initialValue, className }: DateRangePickerProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [range, setRangeDates] = useState<DateRange>({ startDate: null, endDate: null });
    const [tempRange, setTempRange] = useState<DateRange>({ startDate: null, endDate: null });
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const today = new Date();
    const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const [currentView, setCurrentView] = useState({
        month: today.getMonth(),
        year: today.getFullYear(),
    });
    const [nextView, setNextView] = useState({
        month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
        year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
    });

    const displayRange = useMemo(() => {
        const { startDate, endDate } = range;
        return startDate && endDate ? `${formatLocalDate(startDate)} - ${formatLocalDate(endDate)}` : "";
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

    const updateCalendarViews = (direction: "prev" | "next") => {
        const adjust = (view: { month: number; year: number }, diff: number) => {
            const newMonth = view.month + diff;
            return {
                month: (newMonth + 12) % 12,
                year: view.year + Math.floor((newMonth + 12) / 12) - 1,
            };
        };

        const delta = direction === "prev" ? -1 : 1;
        setCurrentView((prev) => adjust(prev, delta));
        setNextView((prev) => adjust(prev, delta));
    };

    const applySelection = () => {
        if (!tempRange.startDate || !tempRange.endDate) return;

        setRangeDates(tempRange);

        onDateRangeChange?.({
            startDate: formatLocalDate(tempRange.startDate),
            endDate: formatLocalDate(tempRange.endDate),
        });
        setIsOpen(false);
    };

    const cancelSelection = () => {
        setTempRange(range);
        setIsOpen(false);
    };

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
        const inRange =
            normalizedDate.getTime() > normalizedStart.getTime() && normalizedDate.getTime() < normalizedEnd.getTime();
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
            case "Today":
                start = end = new Date(normalizedToday);
                break;
            case "Yesterday":
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 1);
                end = new Date(start);
                break;
            case "Last 7 Days":
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 6);
                end = new Date(normalizedToday);
                break;
            case "Last 30 Days":
                start = new Date(normalizedToday);
                start.setDate(start.getDate() - 29);
                end = new Date(normalizedToday);
                break;
            case "This Month":
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                normalizeDate(start);
                normalizeDate(end);
                break;
            case "Last Month":
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                normalizeDate(start);
                normalizeDate(end);
                break;
            case "Last 1 Year":
                start = new Date(normalizedToday);
                start.setFullYear(start.getFullYear() - 1);
                end = new Date(normalizedToday);
                break;
            case "All":
                setRangeDates({ startDate: null, endDate: null });
                setTempRange({ startDate: null, endDate: null });
                setIsOpen(false);
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

            onDateRangeChange?.({ startDate: formatLocalDate(start!), endDate: formatLocalDate(end!) });
        }
    };

    useEffect(() => {
        // Sync with initialValue prop
        if (initialValue?.startDate && initialValue?.endDate) {
            const initialStart = normalizeDate(new Date(initialValue.startDate));
            const initialEnd = normalizeDate(new Date(initialValue.endDate));

            if (initialStart && initialEnd) {
                setRangeDates({ startDate: initialStart, endDate: initialEnd });
                setTempRange({ startDate: initialStart, endDate: initialEnd });
            }
        } else {
            // If initialValue is cleared, reset internal state
            setRangeDates({ startDate: null, endDate: null });
            setTempRange({ startDate: null, endDate: null });
        }
    }, [initialValue]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderCalendar = (days: (Date | null)[], month: number) => (
        <div className="date-range-calendar" style={{ width: 220, minWidth: 220 }}>
            <div
                className="date-range-calendar-weekdays"
                style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}
            >
                {WEEKDAYS.map((day) => (
                    <div key={day} className="date-range-calendar-weekday">
                        {day}
                    </div>
                ))}
            </div>
            <div
                className="date-range-calendar-days"
                style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
            >
                {days.map((date: Date | null, i: number) => {
                    if (!date) {
                        return <div key={i} className="date-range-calendar-day" style={{ height: 30 }}></div>;
                    }

                    const isOtherMonth = date.getMonth() !== month;
                    const isInRangeCheck = isInRange(date);
                    const isStartOrEndCheck = isStartOrEnd(date);
                    const isInHoverRangeCheck = isInHoverRange(date);

                    let className = "date-range-calendar-day";
                    let inlineStyles: React.CSSProperties = {
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    };

                    if (isOtherMonth) {
                        className += " other-month";
                        inlineStyles.color = "#d1d5db";
                    }

                    if (isStartOrEndCheck) {
                        className += " start-end";
                        inlineStyles.backgroundColor = "#2563eb";
                        inlineStyles.color = "white";
                        inlineStyles.border = "2px solid #2563eb";
                        inlineStyles.borderRadius = "50%";
                        inlineStyles.fontWeight = "600";
                    } else if (isInRangeCheck) {
                        className += " in-range";
                        inlineStyles.backgroundColor = "rgba(37, 99, 235, 0.15)";
                        inlineStyles.color = "#1f2937";
                    } else if (isInHoverRangeCheck) {
                        className += " hover-range";
                        inlineStyles.backgroundColor = "rgba(37, 99, 235, 0.2)";
                        inlineStyles.color = "#111827";
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

    const hasRange = range.startDate && range.endDate;

    return (
        <div className={`date-range-picker-container relative ${className || ""}`} ref={containerRef}>
            {hasRange ? (
                <Button
                    variant="outline"
                    className="flex h-12 w-auto items-center justify-between gap-2 rounded-xl border-border bg-background px-3 font-medium text-foreground hover:bg-accent hover:text-accent-foreground sm:w-auto"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm hidden sm:inline">{displayRange}</span>
                    </div>
                    <div
                        role="button"
                        tabIndex={0}
                        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRangeDates({ startDate: null, endDate: null });
                            setTempRange({ startDate: null, endDate: null });
                            onDateRangeChange?.({ startDate: null, endDate: null });
                        }}
                    >
                        <XIcon className="h-3 w-3" />
                    </div>
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl border-border bg-muted/30 hover:bg-background hover:ring-1 hover:ring-ring"
                    onClick={() => setIsOpen(!isOpen)}
                    title="Select Date Range"
                >
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                </Button>
            )}

            {isOpen && (
                <div
                    className="date-range-picker-dropdown absolute z-50 mt-2 flex flex-col lg:flex-row rounded-xl border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 overflow-hidden w-auto left-1/2 -translate-x-1/2"
                >
                    <div className="date-range-presets flex flex-row overflow-x-auto border-b border-border bg-muted/10 p-2 lg:w-36 lg:flex-col lg:border-b-0 lg:border-r lg:py-2">
                        {PREDEFINED_RANGES.map((range) => (
                            <div
                                key={range}
                                className="date-range-preset-item cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground lg:px-4 lg:py-2 lg:text-sm"
                                onClick={() => handleRangeSelect(range)}
                            >
                                {range}
                            </div>
                        ))}
                    </div>

                    <div className="date-range-calendar-container flex flex-col p-2">
                        <div className="date-range-calendar-header mb-4 flex items-center justify-between px-2">
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                onClick={() => updateCalendarViews("prev")}
                            >
                                &lt;
                            </button>
                            <div className="flex text-sm font-semibold">
                                <span className="w-32 text-center">
                                    {new Date(currentView.year, currentView.month).toLocaleString("default", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                                <span className="hidden w-32 text-center lg:block">
                                    {new Date(nextView.year, nextView.month).toLocaleString("default", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                onClick={() => updateCalendarViews("next")}
                            >
                                &gt;
                            </button>
                        </div>

                        <div className="date-range-calendars flex flex-col gap-4 lg:flex-row">
                            {renderCalendar(currentMonthDays, currentView.month)}
                            <div className="hidden lg:block">
                                {renderCalendar(nextMonthDays, nextView.month)}
                            </div>
                        </div>

                        <div className="date-range-footer mt-4 flex items-center justify-between border-t border-border pt-4">
                            <div className="date-range-selected-text text-xs text-muted-foreground mr-2">
                                {tempRange.startDate && tempRange.endDate
                                    ? `${formatLocalDate(tempRange.startDate)} - ${formatLocalDate(tempRange.endDate)}`
                                    : "Select a range"}
                            </div>
                            <div className="date-range-footer-buttons flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cancelSelection}
                                    className="h-8 rounded-lg px-3 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={applySelection}
                                    disabled={!tempRange.startDate || !tempRange.endDate}
                                    className="h-8 rounded-lg px-3 text-xs"
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
