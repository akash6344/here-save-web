import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import CouponCard from '../../components/dashboard/CouponCard';
import AddCouponModal from '../../components/dashboard/AddCouponModal';
import { sidebarData, superadminSidebarData } from '../../constants/layoutData';
import { Plus, Ticket, ChevronDown } from 'lucide-react';
import { fetchCoupons, createCoupon, approveCoupon, rejectCoupon } from '../../services/couponService';
import { fetchOutlets } from '../../services/dashboardService';

const mapCoupon = (c) => {
    let statusLabel = 'Approved';
    if (['PENDING_APPROVAL', 'DRAFT'].includes(c.status)) statusLabel = 'Pending';
    if (['REJECTED', 'EXPIRED', 'DISABLED'].includes(c.status)) statusLabel = 'Rejected';

    const discountValue = parseFloat(c.discount_value || 0);
    let discountStr;
    if (c.coupon_type === 'PERCENTAGE') discountStr = `${discountValue}%`;
    else discountStr = `₹${discountValue}`;

    return {
        id: c.id,
        offer: c.title || 'SPECIAL OFFER',
        type: c.coupon_type || 'FLAT',
        discount: discountStr,
        unit: 'off',
        status: statusLabel,
        rawStatus: c.status,
        outlet_id: c.outlet_id,
    };
};

const Coupons = ({ onNavigate, userRole }) => {
    const [activeTab, setActiveTab] = useState('active');
    const [activeNav, setActiveNav] = useState('coupons');
    const [selectedId, setSelectedId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [modalData, setModalData] = useState(null);
    const [currentLocationIndex, setCurrentLocationIndex] = useState(0);

    const [coupons, setCoupons] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const loadCoupons = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (userRole === 'superadmin' && outlets.length > 0 && outlets[currentLocationIndex]) {
                params.outlet_id = outlets[currentLocationIndex].id;
            }
            const coupData = await fetchCoupons(params);
            const rawCoupons = Array.isArray(coupData?.data) ? coupData.data
                : Array.isArray(coupData) ? coupData : [];
            setCoupons(rawCoupons.map(mapCoupon));
        } catch (err) {
            setError(err.message || 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [userRole, outlets, currentLocationIndex]);

    useEffect(() => {
        // Load outlets for all roles so outlet_id is always available for coupon creation
        const loadOutlets = async () => {
            try {
                const res = await fetchOutlets();
                setOutlets(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
            } catch {/* ignore */ }
        };
        loadOutlets();
    }, [userRole]);

    useEffect(() => {
        loadCoupons();
    }, [loadCoupons]);

    const handleNavChange = (navId) => {
        setActiveNav(navId);
        if (navId === 'dashboard' || navId === 'restaurants') onNavigate?.('dashboard');
        if (navId === 'staff') onNavigate?.('staff');
    };

    const tabs = [
        { id: 'active', label: 'Active Coupons', status: 'Approved' },
        { id: 'pending', label: 'Pending Coupons', status: 'Pending' },
        { id: 'rejected', label: 'Rejected Coupons', status: 'Rejected' },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);
    const filteredCoupons = coupons.filter(c => c.status === currentTab.status);

    const handleCardClick = (id) => setSelectedId(prev => prev === id ? null : id);

    const handleEdit = (id) => {
        const coupon = coupons.find(c => c.id === id);
        setModalData(coupon);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setModalData(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleCancel = () => setSelectedId(null);

    const handleDelete = (id) => {
        console.log('Delete coupon (no backend route yet):', id);
        setSelectedId(null);
    };

    // Safely parse a date string that may be DD/MM/YYYY or YYYY-MM-DD (from <input type="date">)
    const parseDateToISO = (str) => {
        if (!str) return undefined;
        // DD/MM/YYYY → YYYY-MM-DD
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/');
            return new Date(`${y}-${m}-${d}`).toISOString();
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    };

    const handleCreateCoupon = async (formData) => {
        setActionLoading(true);
        setError('');
        try {
            const currentOutlet = outlets[currentLocationIndex] || outlets[0];
            if (!currentOutlet?.id) {
                setError('No outlet found. Please make sure an outlet is assigned to your account.');
                setActionLoading(false);
                return;
            }
            const payload = {
                outlet_id: currentOutlet.id,
                title: formData.name,
                coupon_type: formData.type === 'Amount' ? 'FLAT' : 'PERCENTAGE',
                discount_value: parseFloat(formData.detailsValue) || 0,
                min_purchase_amount: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
                usage_limit_total: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                start_date: parseDateToISO(formData.startDate),
                end_date: parseDateToISO(formData.endDate),
            };
            await createCoupon(payload);
            setIsModalOpen(false);
            await loadCoupons();
        } catch (err) {
            setError(err.message || 'Failed to create coupon');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this coupon?')) return;
        setActionLoading(true);
        try {
            await approveCoupon(id);
            await loadCoupons();
        } catch (err) {
            setError(err.message || 'Failed to approve coupon');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReApprove = async (id) => {
        if (!window.confirm('Are you sure you want to re-approve this rejected coupon?')) return;
        setActionLoading(true);
        try {
            await approveCoupon(id);
            await loadCoupons();
        } catch (err) {
            setError(err.message || 'Failed to re-approve coupon');
        } finally {
            setActionLoading(false);
        }
    };

    const currentSidebarData = userRole === 'superadmin' ? superadminSidebarData : sidebarData;

    return (
        <DashboardLayout
            sidebarData={currentSidebarData}
            activeNav={activeNav}
            onNavChange={handleNavChange}
            title="Coupons"
            role={userRole}
        >
            <div className="flex flex-col gap-8 pb-10">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedId(null); }}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-[20px] text-[15px] font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 border border-primary'
                                    : 'bg-white text-[#999999] hover:text-dark shadow-sm border border-gray-100'}`}
                            >
                                <Ticket size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2}
                                    className={activeTab === tab.id ? 'text-white' : 'text-[#999999]'} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {userRole === 'superadmin' ? (
                        <div className="relative">
                            <select
                                className="appearance-none bg-white text-dark font-semibold text-[14px] pl-12 pr-10 py-3.5 rounded-[20px] shadow-sm border border-gray-100 outline-none cursor-pointer min-w-[180px]"
                                value={currentLocationIndex}
                                onChange={(e) => { setCurrentLocationIndex(Number(e.target.value)); setSelectedId(null); }}
                            >
                                {outlets.length === 0 && <option>No outlets</option>}
                                {outlets.map((station, idx) => (
                                    <option key={station.id} value={idx}>
                                        {station.name || `Location 0${idx + 1}`}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                <Ticket size={18} strokeWidth={2.5} />
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark">
                                <ChevronDown size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-[12px] text-[13.5px] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Coupon
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20 text-gray-400 text-sm">Loading coupons…</div>
                ) : (
                    <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-20 justify-items-center"
                        style={{ columnGap: '5px' }}
                    >
                        {filteredCoupons.map((coupon) => (
                            <div key={coupon.id} className="flex justify-center w-full">
                                <CouponCard
                                    coupon={coupon}
                                    variant="detailed"
                                    status={coupon.status}
                                    isSelected={selectedId === coupon.id}
                                    role={userRole}
                                    onClick={handleCardClick}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onCancel={handleCancel}
                                    onApprove={() => handleApprove(coupon.id)}
                                    onReApprove={() => handleReApprove(coupon.id)}
                                    scale={1.25}
                                />
                            </div>
                        ))}

                        {filteredCoupons.length === 0 && !loading && (
                            <div className="col-span-6 py-16 text-gray-400 text-sm text-center">
                                No {currentTab.label.toLowerCase()} found.
                            </div>
                        )}

                        {userRole !== 'superadmin' && (
                            <div className="flex items-center justify-center h-[262px] w-full" style={{ transform: 'scale(1.25)' }}>
                                <div
                                    onClick={handleAddClick}
                                    className="w-[38px] h-[38px] rounded-[14px] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 hover:scale-110 hover:bg-primary/95 transition-all cursor-pointer active:scale-95"
                                >
                                    <Plus size={18} strokeWidth={3.5} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddCouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateCoupon}
                mode={modalMode}
                initialData={modalData}
                loading={actionLoading}
            />
        </DashboardLayout>
    );
};

export default Coupons;
