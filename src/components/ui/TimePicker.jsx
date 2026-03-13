import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * TimePicker — custom scroll-wheel style time picker (HH:MM AM/PM).
 *
 * Props:
 *   value       – "HH:MM" 24h string or ''
 *   onChange    – ("HH:MM") => void   (always 24h format internally)
 *   placeholder – string
 *   error       – string
 *   label       – string
 */
const TimePicker = ({ value, onChange, placeholder = 'Select time', error, label, className = '' }) => {
    const parseTime = (v) => {
        if (!v) return { hour: 9, minute: 0 };
        const [h, m] = v.split(':').map(Number);
        return { hour: isNaN(h) ? 9 : h, minute: isNaN(m) ? 0 : m };
    };

    const [open, setOpen] = useState(false);
    const [tempHour, setTempHour] = useState(parseTime(value).hour);
    const [tempMinute, setTempMinute] = useState(parseTime(value).minute);
    const ref = useRef(null);

    useEffect(() => {
        if (open) {
            const t = parseTime(value);
            setTempHour(t.hour);
            setTempMinute(t.minute);
        }
    }, [open, value]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const pad = (n) => String(n).padStart(2, '0');
    const to12h = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return { h12, ampm };
    };

    const displayValue = value
        ? (() => { const { h12, ampm } = to12h(parseTime(value).hour); return `${h12}:${pad(parseTime(value).minute)} ${ampm}`; })()
        : '';

    const handleConfirm = () => {
        onChange(`${pad(tempHour)}:${pad(tempMinute)}`);
        setOpen(false);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...55

    const SpinnerCol = ({ items, selected, onSelect, format }) => (
        <div className="flex flex-col items-center gap-1">
            <button type="button" onClick={() => { const idx = items.indexOf(selected); onSelect(items[(idx - 1 + items.length) % items.length]); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <ChevronUp size={16} />
            </button>
            <div className="w-14 h-10 flex items-center justify-center rounded-[10px] bg-primary/10 text-primary font-bold text-[18px]">
                {format(selected)}
            </div>
            <button type="button" onClick={() => { const idx = items.indexOf(selected); onSelect(items[(idx + 1) % items.length]); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <ChevronDown size={16} />
            </button>
        </div>
    );

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
                <Clock size={16} className="text-gray-400 flex-shrink-0" />
            </button>
            {error && <p className="mt-1 text-[12px] text-red-500 ml-1">{error}</p>}

            {open && (
                <div className="absolute z-[200] mt-2 bg-white rounded-[20px] shadow-2xl shadow-black/10 border border-gray-100 p-5 animate-in fade-in zoom-in-95 duration-150"
                    style={{ minWidth: 200 }}>
                    <p className="text-[12px] font-semibold text-gray-400 mb-4 text-center uppercase tracking-wider">Select Time</p>

                    <div className="flex items-center justify-center gap-3 mb-4">
                        <SpinnerCol items={hours} selected={tempHour} onSelect={setTempHour}
                            format={(h) => { const { h12 } = to12h(h); return pad(h12); }} />
                        <span className="text-[22px] font-black text-dark mb-1">:</span>
                        <SpinnerCol items={minutes} selected={tempMinute} onSelect={setTempMinute} format={pad} />
                        <div className="flex flex-col gap-2 ml-1">
                            {['AM', 'PM'].map(period => {
                                const isActive = (period === 'AM' && tempHour < 12) || (period === 'PM' && tempHour >= 12);
                                return (
                                    <button
                                        key={period}
                                        type="button"
                                        onClick={() => {
                                            if (period === 'AM' && tempHour >= 12) setTempHour(h => h - 12);
                                            if (period === 'PM' && tempHour < 12) setTempHour(h => h + 12);
                                        }}
                                        className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {period}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-2.5 bg-primary text-white rounded-[12px] text-[13px] font-bold shadow-md shadow-primary/25 hover:bg-primary/95 transition-all active:scale-[0.98]"
                    >
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
