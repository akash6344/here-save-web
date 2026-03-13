import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Bell } from 'lucide-react';
import ProfilePopover from './ProfilePopover';
import NotificationPopover from './NotificationPopover';

const TopBar = ({ title, role, onAddStation }) => {
    const [showProfile, setShowProfile] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };

        if (showProfile || showNotif) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfile, showNotif]);

    const notifications = [
        {
            title: "Your coupon has been approved and is live.",
            timestamp: "Thursday 2:44PM",
            actionLabel: "View Coupon",
            isUnread: true
        },
        {
            title: "High redemption activity detected in the last 30 min.",
            timestamp: "Thursday 2:44PM",
            actionLabel: "View Transactions",
            isUnread: true
        },
        {
            title: "Your coupon has been Rejected",
            timestamp: "Thursday 2:44PM",
            actionLabel: "View Coupon",
            isUnread: true
        },
    ];

    return (
        <header className="h-[72px] flex items-center px-10 gap-4 shrink-0 bg-[#F3F7FA] relative z-40">
            {/* Back / fwd */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => window.history.length > 1 ? window.history.back() : null}
                    className="p-1.5 hover:bg-white rounded-lg text-[#BBBBBB] hover:text-dark transition-all"
                    aria-label="Go back"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => window.history.forward()}
                    className="p-1.5 hover:bg-white rounded-lg text-dark transition-all"
                    aria-label="Go forward"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <h1 className="text-[15px] font-semibold text-dark ml-4">{title}</h1>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="flex items-center gap-3 bg-white rounded-[16px] px-5 py-3.5 w-[380px] shadow-sm">
                <Search size={18} className="text-[#999999] shrink-0" />
                <input
                    type="text"
                    placeholder="Search for something"
                    className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-[#999999] text-dark font-medium"
                />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => {
                        setShowNotif(!showNotif);
                        setShowProfile(false);
                    }}
                    className={`relative p-3 rounded-full transition-all ${showNotif ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                    <Bell size={22} className="text-dark" />
                    <span className="absolute top-2.5 right-2 w-[18px] h-[18px] bg-primary rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                        3
                    </span>
                </button>

                <NotificationPopover
                    isOpen={showNotif}
                    onClose={() => setShowNotif(false)}
                    notifications={notifications}
                />
            </div>

            {/* Avatar Row */}
            <div className="relative" ref={profileRef}>
                <button
                    onClick={() => {
                        setShowProfile(!showProfile);
                        setShowNotif(false);
                    }}
                    className={`flex items-center p-0.5 rounded-full transition-all ${showProfile ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                    <div className="w-[42px] h-[42px] rounded-full overflow-hidden shrink-0 shadow-sm border border-white">
                        <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2574&auto=format&fit=crop"
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>

                <ProfilePopover
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                />
            </div>
        </header>
    );
};

export default TopBar;
