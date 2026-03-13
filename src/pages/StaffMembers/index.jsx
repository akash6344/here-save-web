import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { sidebarData, superadminSidebarData, staffMembersData } from '../../data/dashboardData';
import { Pencil, Trash2, Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StaffTableRow from '../../components/dashboard/StaffTableRow';
import AddEditStaffModal from '../../components/dashboard/AddEditStaffModal';
import { COLORS } from '../../constants/colors';

const StaffMembers = ({ onNavigate, userRole }) => {
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const handleNavChange = (navId) => {
        if (navId === 'dashboard' || navId === 'restaurants') onNavigate?.('dashboard');
        if (navId === 'coupons') onNavigate?.('coupons');
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentItems = staffMembersData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        if (selectedIds.length === currentItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentItems.map(m => m.id));
        }
    };

    const handleAddClick = () => {
        setEditingMember(null);
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        const member = staffMembersData.find(m => m.id === selectedIds[0]);
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSave = (data) => {
        console.log('Saving staff member:', data);
        setIsModalOpen(false);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStaff = staffMembersData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(staffMembersData.length / itemsPerPage);

    const allSelected = selectedIds.length === currentStaff.length && currentStaff.length > 0;

    const currentSidebarData = userRole === 'superadmin' ? superadminSidebarData : sidebarData;

    return (
        <DashboardLayout
            sidebarData={currentSidebarData}
            activeNav="staff"
            onNavChange={handleNavChange}
            title="Dashboard"
            role={userRole}
        >
            <div className="flex flex-col gap-4 h-full font-onest">
                {/* Combined Actions Row */}
                <div className="flex items-center justify-between">
                    {/* Left Side: Filter */}
                    <div className="flex items-center">
                        <button className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 rounded-[14px] text-[14px] font-semibold text-dark hover:bg-gray-50 transition-all shadow-sm">
                            <img src="/images/filter.svg" alt="filter" className="w-[18px] h-[18px]" />
                            {t('staff.filter')}
                        </button>
                    </div>

                    {/* Right Side: Edit, Delete, Export, Add */}
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

                {/* Table Section */}
                <div className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#DC000408]">
                                    <th className="py-4 pl-5 pr-3 w-[50px]">
                                        <div
                                            onClick={toggleSelectAll}
                                            className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center cursor-pointer transition-all bg-white ${allSelected ? 'bg-primary border-primary' : 'border-gray-300'
                                                }`}
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
                    </div>

                    {/* Centered Pagination */}
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
                                        className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all ${
                                            currentPage === i + 1 
                                            ? 'bg-primary text-white shadow-sm' 
                                            : 'text-gray-400 hover:bg-gray-50'
                                        }`}
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
            />
        </DashboardLayout>
    );
};

export default StaffMembers;
