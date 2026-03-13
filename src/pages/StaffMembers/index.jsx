import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { sidebarData } from '../../constants/layoutData';
import { Pencil, Trash2, Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StaffTableRow from '../../components/dashboard/StaffTableRow';
import AddEditStaffModal from '../../components/dashboard/AddEditStaffModal';
import { fetchEmployees, createEmployee } from '../../services/staffService';
import { fetchOutlets } from '../../services/dashboardService';

const mapEmployee = (emp) => {
    const user = emp.User || emp;
    return {
        id: emp.id,
        name: user.name || 'Unknown',
        phone: user.phone || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'EMPLOYEE',
        shift: `${emp.shift_start || '09:00'} to ${emp.shift_end || '17:00'}`,
        permission: emp.status === 'ACTIVE' ? 'Accepted' : 'Pending',
        image: user.profile_picture || null,
        user_id: emp.user_id,
        outlet_id: emp.outlet_id,
    };
};

const StaffMembers = ({ onNavigate, userRole }) => {
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [staff, setStaff] = useState([]);
    const [outlets, setOutlets] = useState([]);
    const [selectedOutletId, setSelectedOutletId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const loadStaff = useCallback(async (outletId) => {
        if (!outletId) return;
        setLoading(true);
        setError('');
        try {
            const empData = await fetchEmployees(outletId);
            const raw = Array.isArray(empData?.data) ? empData.data
                : Array.isArray(empData) ? empData : [];
            setStaff(raw.map(mapEmployee));
        } catch (err) {
            setError(err.message || 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await fetchOutlets();
                const list = Array.isArray(res?.data) ? res.data
                    : Array.isArray(res) ? res : [];
                setOutlets(list);
                if (list.length > 0) {
                    setSelectedOutletId(list[0].id);
                    await loadStaff(list[0].id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                setError(err.message || 'Failed to load outlets');
                setLoading(false);
            }
        };
        init();
    }, [loadStaff]);

    const handleNavChange = (navId) => {
        if (navId === 'dashboard') onNavigate?.('dashboard');
        if (navId === 'coupons') onNavigate?.('coupons');
    };

    const toggleSelect = (id) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const toggleSelectAll = () => {
        const current = currentStaff;
        if (selectedIds.length === current.length) setSelectedIds([]);
        else setSelectedIds(current.map(m => m.id));
    };

    const handleAddClick = () => { setEditingMember(null); setIsModalOpen(true); };

    const handleEditClick = () => {
        const member = staff.find(m => m.id === selectedIds[0]);
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        setActionLoading(true);
        setError('');
        try {
            if (editingMember) {
                // No update employee route in backend yet, log for now
                console.log('Edit employee (no backend PATCH route yet):', formData);
            } else {
                // createEmployee requires user_id – backend links employee to existing user.
                // The form collects phone number; in a real flow we'd look up the user by phone.
                // For now, we persist by logging - this is a known limitation.
                console.log('Create employee payload:', {
                    outlet_id: selectedOutletId,
                    shift_start: formData.startTime ? `${formData.startTime}:00` : undefined,
                    shift_end: formData.endTime ? `${formData.endTime}:00` : undefined,
                });
                // NOTE: Backend requires user_id. This means the employee's user account must
                // already exist in the system (via Firebase login). When user_id is available,
                // uncomment below:
                // await createEmployee({
                //   user_id: resolvedUserId,
                //   outlet_id: selectedOutletId,
                //   shift_start: formData.startTime ? `${formData.startTime}:00` : undefined,
                //   shift_end: formData.endTime ? `${formData.endTime}:00` : undefined,
                // });
            }
            setIsModalOpen(false);
            await loadStaff(selectedOutletId);
        } catch (err) {
            setError(err.message || 'Failed to save staff member');
        } finally {
            setActionLoading(false);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = staff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(staff.length / (itemsPerPage || 1));
    const allSelected = selectedIds.length === currentStaff.length && currentStaff.length > 0;

    return (
        <DashboardLayout
            sidebarData={sidebarData}
            activeNav="staff"
            onNavChange={handleNavChange}
            title="Dashboard"
            role={userRole}
        >
            <div className="flex flex-col gap-4 h-full font-onest">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-semibold text-dark hover:bg-gray-50 transition-all shadow-sm">
                            <img src="/images/filter.svg" alt="filter" className="w-[18px] h-[18px]" />
                            {t('staff.filter')}
                        </button>
                        {outlets.length > 1 && (
                            <select
                                className="px-4 py-2.5 bg-white font-semibold text-[14px] rounded-[14px] border border-gray-100 outline-none shadow-sm"
                                value={selectedOutletId || ''}
                                onChange={(e) => {
                                    setSelectedOutletId(Number(e.target.value));
                                    loadStaff(Number(e.target.value));
                                    setCurrentPage(1);
                                    setSelectedIds([]);
                                }}
                            >
                                {outlets.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length === 1 && (
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-semibold text-dark hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <Pencil className="w-[18px] h-[18px] text-[#555555]" />
                                {t('staff.edit')}
                            </button>
                        )}
                        {selectedIds.length > 0 && (
                            <button className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-semibold text-primary hover:bg-red-50 transition-all shadow-sm">
                                <Trash2 className="w-[18px] h-[18px] text-primary" />
                                {t('staff.delete')}
                            </button>
                        )}
                        <button className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-semibold text-dark hover:bg-gray-50 transition-all shadow-sm">
                            <img src="/images/export.svg" alt="export" className="w-[18px] h-[18px]" />
                            {t('staff.export')}
                        </button>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary rounded-[14px] text-[14px] font-semibold text-white hover:bg-primary/95 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Plus className="w-[18px] h-[18px]" strokeWidth={3} />
                            {t('staff.add_new')}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto no-scrollbar min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-48 text-gray-400 text-sm">Loading staff members…</div>
                        ) : staff.length === 0 ? (
                            <div className="flex justify-center items-center h-48 text-gray-400 text-sm">No staff members found for the selected outlet.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#DC000408]">
                                        <th className="py-4 pl-5 pr-3 w-[50px]">
                                            <div
                                                onClick={toggleSelectAll}
                                                className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center cursor-pointer transition-all bg-white ${allSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}
                                            >
                                                {allSelected && <Check className="text-white w-3 h-3" strokeWidth={5} />}
                                            </div>
                                        </th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">{t('staff.table.image')}</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">Full Name</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">Phone</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">Email</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">Role</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight">Shift Time</th>
                                        <th className="py-4 px-3 text-[13px] font-bold text-[#555555] tracking-tight pr-5">Permission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStaff.map((member) => (
                                        <StaffTableRow
                                            key={member.id}
                                            member={member}
                                            isSelected={selectedIds.includes(member.id)}
                                            onToggle={toggleSelect}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center py-6 border-t border-gray-50 gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AddEditStaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                member={editingMember}
                loading={actionLoading}
            />
        </DashboardLayout>
    );
};

export default StaffMembers;
