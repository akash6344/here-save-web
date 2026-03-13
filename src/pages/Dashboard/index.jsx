import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StationDetailCard from '../../components/dashboard/StationDetailCard';
import StatsChart from '../../components/dashboard/StatsChart';
import CouponCard from '../../components/dashboard/CouponCard';
import TransactionRow from '../../components/dashboard/TransactionRow';
import TransactionHistoryView from '../../components/dashboard/TransactionHistoryView';
import BillSidebar from '../../components/dashboard/BillSidebar';
import AddEditStationModal from '../../components/dashboard/AddEditStationModal';
import { sidebarData, superadminSidebarData } from '../../constants/layoutData';
import {
    fetchOutlets,
    fetchOutletAnalytics,
    createOutlet,
    updateOutlet,
} from '../../services/dashboardService';
import { fetchCoupons } from '../../services/couponService';
import { fetchRedemptions } from '../../services/redemptionService';

const mapCoupon = (c) => {
    const discountValue = parseFloat(c.discount_value || 0);
    const discountStr = c.coupon_type === 'PERCENTAGE' ? `${discountValue}%` : `₹${discountValue}`;
    return { id: c.id, offer: c.title, type: c.coupon_type, discount: discountStr, unit: 'off', status: 'Approved' };
};

const mapTransaction = (t) => ({
    id: t.id,
    status: 'Approved',
    amount: `₹${t.bill_amount_before_discount || 0}`,
    discount: `-₹${t.discount_applied || 0}`,
    couponId: `C${t.coupon_id}`,
    date: t.redeemed_at ? new Date(t.redeemed_at).toLocaleDateString('en-GB') : '-',
    time: t.redeemed_at ? new Date(t.redeemed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
});

const Dashboard = ({ onNavigate, userRole }) => {
    const [activeNav, setActiveNav] = useState('dashboard');
    const [view, setView] = useState('dashboard');
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [isAddStationOpen, setIsAddStationOpen] = useState(false);
    const [stationToEdit, setStationToEdit] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [outlets, setOutlets] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const isRestaurants = activeNav === 'restaurants';

    // Load outlets
    const loadOutlets = useCallback(async () => {
        try {
            const params = isRestaurants ? { type: 'RESTAURANT' } : {};
            const res = await fetchOutlets(params);
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            const filtered = isRestaurants ? list.filter(o => o.type === 'RESTAURANT') : list;
            setOutlets(filtered);
            setCurrentIndex(0);
        } catch (err) {
            setError(err.message || 'Failed to load outlets');
        }
    }, [isRestaurants]);

    useEffect(() => { loadOutlets(); }, [loadOutlets]);

    // Load dashboard data for current outlet
    const loadDashboardData = useCallback(async () => {
        const outlet = outlets[currentIndex];
        if (!outlet) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [analyticsRes, couponsRes, txRes] = await Promise.all([
                fetchOutletAnalytics(outlet.id).catch(() => null),
                fetchCoupons({ outlet_id: outlet.id, status: 'APPROVED' }).catch(() => null),
                fetchRedemptions({ outlet_id: outlet.id }).catch(() => null),
            ]);

            // Chart data
            if (analyticsRes?.daily_redemptions) {
                setChartData(analyticsRes.daily_redemptions.map(d => ({
                    month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    redemptions: parseInt(d.redemptions_count || 0),
                    discounts: parseFloat(d.total_discount_given || 0),
                    totalSales: parseFloat(d.pre_discount_sales || 0),
                })));
            } else {
                setChartData([]);
            }

            // Coupons
            const rawCoupons = Array.isArray(couponsRes?.data) ? couponsRes.data
                : Array.isArray(couponsRes) ? couponsRes : [];
            setActiveCoupons(rawCoupons.map(mapCoupon));

            // Transactions
            const rawTx = Array.isArray(txRes?.data) ? txRes.data
                : Array.isArray(txRes) ? txRes : [];
            setTransactionHistory(rawTx.map(mapTransaction));
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [outlets, currentIndex]);

    useEffect(() => {
        if (outlets.length > 0) loadDashboardData();
        else setLoading(false);
    }, [outlets, currentIndex, loadDashboardData]);

    const handleNavChange = (navId) => {
        setActiveNav(navId);
        setView('dashboard');
        if (navId === 'coupons') onNavigate?.('coupons');
        if (navId === 'staff') onNavigate?.('staff');
    };

    const handleSaveStation = async (formData) => {
        setActionLoading(true);
        setError('');
        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                type: isRestaurants ? 'RESTAURANT' : 'PETROL',
            };
            if (stationToEdit) {
                await updateOutlet(stationToEdit.outletId || stationToEdit.id, payload);
            } else {
                await createOutlet(payload);
            }
            setIsAddStationOpen(false);
            setStationToEdit(null);
            await loadOutlets();
        } catch (err) {
            setError(err.message || 'Failed to save outlet');
        } finally {
            setActionLoading(false);
        }
    };

    const currentEntityObj = outlets[currentIndex] || {};
    const currentSidebarData = userRole === 'superadmin' ? superadminSidebarData : sidebarData;

    const stationDetailData = {
        name: currentEntityObj.name || 'Unknown Outlet',
        icon: isRestaurants ? 'utensils' : 'fuel',
        address: currentEntityObj.address || 'No address',
        status: currentEntityObj.status || 'ACTIVE',
        outletId: currentEntityObj.id,
        manager: currentEntityObj.manager_name || 'N/A',
        contact: currentEntityObj.contact_number || 'N/A',
    };

    return (
        <>
            <DashboardLayout
                sidebarData={currentSidebarData}
                activeNav={activeNav}
                onNavChange={handleNavChange}
                activeSubNav={currentIndex}
                onSubNavChange={setCurrentIndex}
                title={view === 'transactions' ? 'Transaction History' : 'Dashboard'}
                role={userRole}
                onAddStation={() => { setStationToEdit(null); setIsAddStationOpen(true); }}
            >
                <div className="flex gap-6 h-full">
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {view === 'dashboard' ? (
                            <>
                                {userRole === 'superadmin' && (
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                                disabled={currentIndex <= 0}
                                                className={`w-12 h-12 flex items-center justify-center rounded-[16px] transition-all focus:outline-none ${currentIndex > 0 ? 'bg-white text-[#939393] hover:bg-gray-50' : 'bg-[#F4F4F4]/50 text-[#C4C4C4]'}`}
                                            >
                                                <ChevronLeft size={24} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => setCurrentIndex(prev => Math.min(outlets.length - 1, prev + 1))}
                                                disabled={currentIndex >= outlets.length - 1}
                                                className={`w-12 h-12 flex items-center justify-center rounded-[16px] transition-all focus:outline-none ${currentIndex < outlets.length - 1 ? 'bg-white text-[#939393] hover:bg-gray-50' : 'bg-[#F4F4F4]/50 text-[#C4C4C4]'}`}
                                            >
                                                <ChevronRight size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { setStationToEdit(null); setIsAddStationOpen(true); }}
                                            className="bg-[#DC0004] text-white px-6 py-3.5 rounded-[12px] text-[14px] font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
                                        >
                                            <span className="text-[18px] leading-none">+</span>
                                            {isRestaurants ? 'Add Restaurant' : 'Add Petrol Station'}
                                        </button>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="flex bg-white h-40 rounded-xl justify-center items-center text-gray-400 text-sm">
                                        Loading dashboard data…
                                    </div>
                                ) : outlets.length === 0 ? (
                                    <div className="flex bg-white h-40 rounded-xl justify-center items-center text-gray-400 text-sm">
                                        No outlets found.
                                    </div>
                                ) : (
                                    <>
                                        <StationDetailCard
                                            data={stationDetailData}
                                            role={userRole}
                                            entityType={isRestaurants ? 'restaurant' : 'station'}
                                            onEdit={() => {
                                                setStationToEdit(stationDetailData);
                                                setIsAddStationOpen(true);
                                            }}
                                        />

                                        <StatsChart data={chartData} statsData={[]} />

                                        <div className="bg-white rounded-[16px] px-6 py-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-[#F3F7FA] flex items-center justify-center">
                                                    <img src="/images/activecoupns.png" alt="coupons" className="w-[18px] h-[18px]" />
                                                </div>
                                                <span className="text-[14px] font-semibold text-dark">Active Coupons</span>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                                                {activeCoupons.length > 0
                                                    ? activeCoupons.map(c => <CouponCard key={c.id} coupon={c} />)
                                                    : <div className="text-gray-400 text-sm py-4">No active coupons.</div>}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[16px] px-6 py-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#F3F7FA] flex items-center justify-center">
                                                        <img src="/images/transactionhis.png" alt="transactions" className="w-[18px] h-[18px]" />
                                                    </div>
                                                    <span className="text-[14px] font-semibold text-dark">Transaction History</span>
                                                </div>
                                                <button
                                                    onClick={() => setView('transactions')}
                                                    className="text-[12px] text-dark font-medium hover:text-primary transition-colors"
                                                >
                                                    View full Transaction
                                                </button>
                                            </div>
                                            {transactionHistory.length > 0
                                                ? transactionHistory.slice(0, 3).map(tx => (
                                                    <TransactionRow key={tx.id} transaction={tx} />
                                                ))
                                                : <div className="text-gray-400 text-sm">No recent transactions.</div>}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <TransactionHistoryView
                                transactions={transactionHistory}
                                selectedId={selectedTransactionId}
                                onViewBill={(id) => setSelectedTransactionId(prev => prev === id ? null : id)}
                            />
                        )}
                    </div>

                    {view === 'transactions' && selectedTransactionId && (
                        <BillSidebar
                            transaction={transactionHistory.find(t => t.id === selectedTransactionId)}
                            onClose={() => setSelectedTransactionId(null)}
                        />
                    )}
                </div>
            </DashboardLayout>

            <AddEditStationModal
                isOpen={isAddStationOpen}
                onClose={() => { setIsAddStationOpen(false); setStationToEdit(null); }}
                onSave={handleSaveStation}
                station={stationToEdit}
                entityType={isRestaurants ? 'restaurant' : 'station'}
                loading={actionLoading}
            />
        </>
    );
};

export default Dashboard;
