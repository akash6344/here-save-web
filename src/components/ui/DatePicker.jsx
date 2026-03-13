import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * DatePicker — fully custom calendar, no browser chrome.
 *
 * Props:
 *   value       – YYYY-MM-DD string or ''
 *   onChange    – (YYYY-MM-DD) => void
 *   placeholder – string
 *   minDate     – YYYY-MM-DD string (optional)
 *   maxDate     – YYYY-MM-DD string (optional)
 *   error       – string (validation message)
 *   label       – string
 */
const DatePicker = ({ value, onChange, placeholder = 'Select date', minDate, maxDate, error, label, className = '' }) => {
    const today = new Date();
    const parseDate = (str) => str ? new Date(str + 'T00:00:00') : null;
    const selected = parseDate(value);

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Compute days in the grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
    const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

    const toISO = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const isDisabled = (iso) => {
        if (minDate && iso < minDate) return true;
        if (maxDate && iso > maxDate) return true;
        return false;
    };

    const handleSelect = (day) => {
        const iso = toISO(viewYear, viewMonth, day);
        if (isDisabled(iso)) return;
        onChange(iso);
        setOpen(false);
    };

    const displayValue = selected
        ? selected.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

    return (
        <div ref={ref} className={`relative ${className}`}>
            {label && <label className="block text-[13px] font-bold text-dark/80 mb-2">{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center justify-between bg-[#F5F7F9] rounded-[16px] px-4 py-3.5 text-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? 'ring-2 ring-red-400' : ''}`}
            >
                <span className={displayValue ? 'text-dark' : 'text-gray-400'}>
                    {displayValue || placeholder}
                </span>
                <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            </button>
            {error && <p className="mt-1 text-[12px] text-red-500 ml-1">{error}</p>}

            {open && (
                <div className="absolute z-[200] mt-2 bg-white rounded-[20px] shadow-2xl shadow-black/10 border border-gray-100 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-150"
                    style={{ left: 0 }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[13px] font-bold text-dark">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 pb-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const iso = toISO(viewYear, viewMonth, day);
                            const isSelected = value === iso;
                            const disabled = isDisabled(iso);
                            const isToday = iso === toISO(today.getFullYear(), today.getMonth(), today.getDate());

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    disabled={disabled}
                                    className={`
                                        h-8 w-8 mx-auto flex items-center justify-center rounded-full text-[13px] font-medium transition-all
                                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
                                        ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary' : ''}
                                        ${isToday && !isSelected ? 'ring-1 ring-primary/40 text-primary font-bold' : ''}
                                        ${!isSelected && !disabled ? 'text-dark' : ''}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today shortcut */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                const iso = toISO(today.getFullYear(), today.getMonth(), today.getDate());
                                if (!isDisabled(iso)) { onChange(iso); setOpen(false); }
                                else { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }
                            }}
                            className="w-full text-center text-[12px] font-semibold text-primary hover:text-primary/70 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
