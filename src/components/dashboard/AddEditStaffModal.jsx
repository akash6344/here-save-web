import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TimePicker from '../ui/TimePicker';

const AddEditStaffModal = ({ isOpen, onClose, onSave, member = null }) => {
    const { t } = useTranslation();

    const emptyForm = { name: '', phone: '', role: '', startTime: '', endTime: '' };
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (member) {
                setFormData({
                    name: member.name || '',
                    phone: member.phone || '',
                    role: member.role || '',
                    startTime: member.shift?.split(' to ')[0] || '',
                    endTime: member.shift?.split(' to ')[1] || '',
                });
            } else {
                setFormData(emptyForm);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, member]);

    if (!isOpen) return null;

    const roles = ['Cashier', 'Manager', 'Attendant'];

    const setField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    // Compare HH:MM strings
    const timeToMinutes = (t) => {
        if (!t) return null;
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const validate = () => {
        const e = {};

        if (!formData.name.trim()) e.name = 'Full name is required.';
        else if (formData.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

        if (!formData.phone.trim()) e.phone = 'Phone number is required.';
        else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, '')))
            e.phone = 'Enter a valid phone number (10–15 digits).';

        if (!formData.role) e.role = 'Please select a role.';

        if (!formData.startTime) e.startTime = 'Start time is required.';
        if (!formData.endTime) e.endTime = 'End time is required.';

        if (formData.startTime && formData.endTime) {
            const sm = timeToMinutes(formData.startTime);
            const em = timeToMinutes(formData.endTime);
            if (em <= sm) e.endTime = 'End time must be after start time.';
        }

        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSubmitting(true);
        try {
            await onSave(formData);
        } finally {
            setSubmitting(false);
        }
    };

    const Field = ({ label, error, children }) => (
        <div className="space-y-2">
            {label && <label className="text-[13px] font-semibold text-[#555555] ml-1">{label}</label>}
            {children}
            {error && <p className="text-[12px] text-red-500 ml-1 flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-black text-red-500 flex-shrink-0">!</span>
                {error}
            </p>}
        </div>
    );

    const inputCls = (hasError) =>
        `w-full px-5 py-4 bg-[#F8F9FA] border rounded-[16px] text-[15px] focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-gray-400 ${hasError ? 'border-red-400 ring-2 ring-red-100' : 'border-transparent focus:border-primary/20'}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" onClick={onClose} />
            <div className="relative bg-white rounded-[32px] w-full max-w-[440px] shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 font-onest">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-[12px] bg-[#FFF5F5] flex items-center justify-center">
                            <Users className="text-primary w-5 h-5" />
                        </div>
                        <h2 className="text-[20px] font-bold text-dark">
                            {member ? t('staff.modal.edit_title') : t('staff.modal.add_title')}
                        </h2>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <Field label={t('staff.modal.name_label')} error={errors.name}>
                            <input
                                type="text"
                                placeholder={t('staff.modal.name_placeholder')}
                                value={formData.name}
                                onChange={(e) => setField('name', e.target.value)}
                                className={inputCls(!!errors.name)}
                            />
                        </Field>

                        <Field label={t('staff.modal.phone_label')} error={errors.phone}>
                            <input
                                type="tel"
                                placeholder={t('staff.modal.phone_placeholder')}
                                value={formData.phone}
                                onChange={(e) => {
                                    // Only allow digits, +, spaces
                                    const v = e.target.value.replace(/[^\d+\s\-]/g, '');
                                    setField('phone', v);
                                }}
                                className={inputCls(!!errors.phone)}
                            />
                        </Field>

                        <Field label={t('staff.modal.role_label')} error={errors.role}>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setField('role', e.target.value)}
                                    className={`${inputCls(!!errors.role)} appearance-none`}
                                >
                                    <option value="" disabled>{t('staff.modal.role_placeholder')}</option>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="#939393" strokeWidth="2" strokeLinecap="round" /></svg>
                                </div>
                            </div>
                        </Field>

                        {/* Shift Times */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <TimePicker
                                    label={t('staff.modal.start_time')}
                                    value={formData.startTime}
                                    onChange={(v) => {
                                        setField('startTime', v);
                                        setErrors(prev => ({ ...prev, endTime: '' }));
                                    }}
                                    error={errors.startTime}
                                />
                            </div>
                            <div className="flex-1">
                                <TimePicker
                                    label={t('staff.modal.end_time')}
                                    value={formData.endTime}
                                    onChange={(v) => setField('endTime', v)}
                                    error={errors.endTime}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-4 mt-8">
                        <button onClick={onClose}
                            className="flex-1 py-4 bg-[#F3F3F3] text-[#555555] font-semibold rounded-[16px] hover:bg-gray-200 transition-all">
                            {t('staff.modal.cancel')}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 py-4 bg-primary text-white font-semibold rounded-[16px] hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : member ? t('staff.modal.save') : t('staff.modal.add')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditStaffModal;
