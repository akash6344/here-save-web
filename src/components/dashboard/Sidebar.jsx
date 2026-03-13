import React, { useState } from 'react';
import { LayoutDashboard, Ticket, Users, Fuel, Utensils, ChevronDown } from 'lucide-react';

const ICON_MAP = {
    LayoutDashboard,
    Ticket,
    Users,
    Fuel,
    Utensils,
};

const Sidebar = ({ data, activeNav, onNavChange, activeSubNav, onSubNavChange }) => {
    // Keep track of which nav items are expanded (for sub-items)
    const [expandedNavs, setExpandedNavs] = useState([activeNav]);

    const handleNavClick = (itemId, hasSubItems) => {
        onNavChange(itemId);
        
        if (hasSubItems) {
            setExpandedNavs(prev => 
                prev.includes(itemId) 
                    ? prev.filter(id => id !== itemId) 
                    : [...prev, itemId]
            );
        }
    };
    return (
        <aside className="w-[220px] min-h-screen bg-white flex flex-col pt-6 pb-8 px-5 shrink-0 border-r border-gray-100">
            {/* Logo */}
            <div className="mb-7 px-1">
                <span className="text-primary font-bold text-[20px] leading-[1.15] block">
                    Here&<br />Save
                </span>
            </div>

            {/* Station Info - hide if label is null */}
            {data.stationLabel && (
                <div className="bg-[#F3F7FA] rounded-[12px] p-3 mb-7">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <img src="/images/oil.svg" alt="station" className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-semibold text-dark truncate leading-tight">{data.stationLabel}</span>
                    </div>
                    <p className="text-[9px] text-grayCustom leading-[1.5]">{data.stationAddress}</p>
                </div>
            )}

            {/* Nav */}
            <nav className="flex flex-col gap-0.5">
                {data.navItems.map((item) => {
                    const Icon = ICON_MAP[item.icon];
                    const isActive = activeNav === item.id;
                    return (
                        <div key={item.id} className="flex flex-col">
                            <button
                                onClick={() => handleNavClick(item.id, !!item.subItems)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-semibold transition-colors text-left w-full ${isActive
                                    ? 'text-primary'
                                    : 'text-[#939393] hover:text-dark'
                                    }`}
                            >
                                {Icon && <Icon size={16} className="shrink-0" strokeWidth={isActive ? 2 : 1.5} />}
                                <span className="whitespace-nowrap">{item.label}</span>
                                {item.subItems && (
                                    <span className="ml-auto opacity-50 shrink-0">
                                        <ChevronDown size={14} className={expandedNavs.includes(item.id) ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                    </span>
                                )}
                            </button>

                            {/* Sub Items Tree View */}
                            {expandedNavs.includes(item.id) && item.subItems && (
                                <div className="mt-1 flex flex-col relative pl-[22px] ml-3 border-l border-[#E5E5E5] pb-2">
                                    {item.subItems.map((subItem, index) => {
                                        const isSubActive = isActive && activeSubNav === subItem.id;
                                        return (
                                            <button
                                                key={subItem.id}
                                                onClick={() => {
                                                    onNavChange(item.id);
                                                    onSubNavChange && onSubNavChange(subItem.id);
                                                }}
                                                className={`relative py-2 text-[12px] font-medium text-left transition-colors ${isSubActive ? 'text-primary font-bold' : 'text-[#939393] hover:text-dark'
                                                    }`}
                                            >
                                                {/* Horizontal branch line */}
                                                <div className="absolute left-[-22px] top-1/2 w-4 h-[1px] bg-[#E5E5E5]" />
                                                {subItem.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
