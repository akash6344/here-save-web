import React from 'react';

const NotificationPopover = ({ isOpen, onClose, notifications = [], onMarkAllRead }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-[44px] top-[64px] w-[520px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-pop-in">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
                <h2 className="text-[18px] font-bold text-dark">Your notifications</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onMarkAllRead}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[12px] font-bold text-dark rounded-[10px] transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                        <div
                            key={notif.id || index}
                            className="flex items-start gap-4 px-8 py-6 hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-50 last:border-0"
                        >
                            <div className="w-[64px] h-[64px] rounded-full bg-[#F3F7FA] shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-0.5">
                                    <p className="text-[13.5px] font-bold text-dark leading-tight line-clamp-2">
                                        {notif.title}
                                    </p>
                                    {notif.isUnread && (
                                        <div className="w-[8px] h-[8px] bg-primary rounded-full shrink-0 mt-1" />
                                    )}
                                </div>
                                <p className="text-[12.5px] text-[#999999] mb-2">{notif.timestamp}</p>
                                <button className="px-3.5 py-1.5 bg-white border border-gray-100 hover:bg-gray-50 text-[12.5px] font-bold text-dark rounded-[10px] transition-all active:scale-95 shadow-sm">
                                    {notif.actionLabel}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <p className="text-[18px] font-bold text-[#CCCCCC]">No notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPopover;
