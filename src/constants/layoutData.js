export const sidebarData = {
    logo: { text: 'Here&\\nSave', color: '#DC0004' },
    stationLabel: 'My Station', // Default fallback
    stationAddress: 'Address', // Default fallback
    navItems: [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
        { id: 'coupons', label: 'Coupons', icon: 'Ticket', path: '/coupons' },
        { id: 'staff', label: 'Staff members', icon: 'Users', path: '/staff' },
    ],
};

export const superadminSidebarData = {
    logo: { text: 'Here&\\nSave', color: '#DC0004' },
    stationLabel: null,
    stationAddress: null,
    navItems: [
        {
            id: 'dashboard',
            label: 'Petrol Stations',
            icon: 'Fuel',
            path: '/dashboard',
            subItems: []
        },
        {
            id: 'restaurants',
            label: 'Resturents',
            icon: 'Utensils',
            path: '/restaurants',
            subItems: []
        },
        { id: 'coupons', label: 'Coupons', icon: 'Ticket', path: '/coupons' },
        { id: 'staff', label: 'Staff members', icon: 'Users', path: '/staff' },
    ],
};
