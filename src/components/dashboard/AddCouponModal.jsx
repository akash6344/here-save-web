import React, { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';
import DatePicker from '../ui/DatePicker';

const FIELD_LABELS = {
    name: 'Coupon Name',
    detailsValue: 'Discount Value',
    minPurchase: 'Minimum Purchase Amount',
    usageLimit: 'Usage Limit',
    startDate: 'Start Date',
    endDate: 'End Date',
};

const AddCouponModal = ({ isOpen, onClose, onCreate, initialData, mode = 'add' }) => {
    const todayISO = new Date().toISOString().split('T')[0];

    const emptyForm = {
        name: '',
        type: 'Amount',            // 'Amount' | 'Percentage'
        detailsHeader: 'Flat',     // 'Flat' | 'Upto'
        detailsValue: '',
        minPurchase: '',
        usageLimit: '',
        startDate: todayISO,
        endDate: '',
    };

    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (initialData && mode === 'edit') {
                setFormData({
                    name: initialData.name || '',
                    type: initialData.type || 'Amount',
                    detailsHeader: initialData.detailsHeader || 'Flat',
                    detailsValue: initialData.discount || '',
                    minPurchase: initialData.minPurchase || '',
                    usageLimit: initialData.usageLimit || '',
                    startDate: initialData.startDate || todayISO,
                    endDate: initialData.endDate || '',
                });
            } else {
                setFormData(emptyForm);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, mode]);

    if (!isOpen) return null;

    const setField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        // Clear error when user edits
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const e = {};

        if (!formData.name.trim()) e.name = 'Coupon name is required.';
        else if (formData.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';

        const val = parseFloat(formData.detailsValue);
        if (!formData.detailsValue) e.detailsValue = 'Discount value is required.';
        else if (isNaN(val) || val <= 0) e.detailsValue = 'Must be a positive number.';
        else if (formData.type === 'Percentage' && val > 100) e.detailsValue = 'Percentage cannot exceed 100.';

        if (formData.minPurchase && isNaN(parseFloat(formData.minPurchase)))
            e.minPurchase = 'Must be a valid number.';

        if (formData.usageLimit) {
            const ul = parseInt(formData.usageLimit);
            if (isNaN(ul) || ul <= 0) e.usageLimit = 'Must be a positive whole number.';
        }

        if (!formData.startDate) e.startDate = 'Start date is required.';

        if (formData.endDate && formData.startDate && formData.endDate <= formData.startDate)
            e.endDate = 'End date must be after start date.';

        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSubmitting(true);
        try {
            await onCreate(formData);
        } finally {
            setSubmitting(false);
        }
    };

    const Field = ({ label, error, children }) => (
        <div>
            {label && <label className="block text-[13px] font-bold text-dark/80 mb-2">{label}</label>}
            {children}
            {error && <p className="mt-1.5 text-[12px] text-red-500 ml-1 flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-black text-red-500 flex-shrink-0">!</span>
                {error}
            </p>}
        </div>
    );

    const inputCls = (hasError) =>
        `w-full bg-[#F5F7F9] border-none rounded-[16px] px-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 ${hasError ? 'ring-2 ring-red-400' : ''}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[12px]" onClick={onClose} />

            <div className="relative bg-white w-full max-w-[460px] rounded-[32px] shadow-2xl overflow-visible animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400">
                        <X size={16} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-[#FFF5F5] flex items-center justify-center">
                            <Ticket className="text-primary" size={20} />
                        </div>
                        <h2 className="text-[20px] font-bold text-dark">
                            {mode === 'edit' ? 'Edit Coupon' : 'Add Coupon'}
                        </h2>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        {/* Name */}
                        <Field label="Coupon Name" error={errors.name}>
                            <input
                                type="text"
                                placeholder="e.g. Summer Sale 20% Off"
                                className={inputCls(!!errors.name)}
                                value={formData.name}
                                onChange={(e) => setField('name', e.target.value)}
                            />
                        </Field>

                        {/* Type Toggle */}
                        <div>
                            <label className="block text-[13px] font-bold text-dark/80 mb-2">Coupon Type</label>
                            <div className="flex bg-[#F5F7F9] p-1 rounded-[16px]">
                                {['Amount', 'Percentage'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setField('type', t)}
                                        className={`flex-1 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all ${formData.type === t ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                                    >
                                        {t} {t === 'Amount' ? '(₹)' : '(%)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Discount Value */}
                        <Field label={`Discount ${formData.type === 'Amount' ? 'Amount (₹)' : 'Percentage (%)'}`} error={errors.detailsValue}>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] font-medium">
                                    {formData.type === 'Amount' ? '₹' : '%'}
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max={formData.type === 'Percentage' ? '100' : undefined}
                                    placeholder={formData.type === 'Amount' ? '500' : '20'}
                                    className={`${inputCls(!!errors.detailsValue)} pl-8`}
                                    value={formData.detailsValue}
                                    onChange={(e) => setField('detailsValue', e.target.value)}
                                />
                            </div>
                        </Field>

                        {/* Min Purchase */}
                        <Field label="Minimum Purchase Amount (₹)  — optional" error={errors.minPurchase}>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] font-medium">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="500"
                                    className={`${inputCls(!!errors.minPurchase)} pl-8`}
                                    value={formData.minPurchase}
                                    onChange={(e) => setField('minPurchase', e.target.value)}
                                />
                            </div>
                        </Field>

                        {/* Usage Limit */}
                        <Field label="Usage Limit — optional" error={errors.usageLimit}>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="e.g. 100"
                                className={inputCls(!!errors.usageLimit)}
                                value={formData.usageLimit}
                                onChange={(e) => setField('usageLimit', e.target.value)}
                            />
                        </Field>

                        {/* Dates */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <DatePicker
                                    label="Start Date"
                                    value={formData.startDate}
                                    onChange={(v) => {
                                        setField('startDate', v);
                                        // Clear end date error if start changes
                                        setErrors(prev => ({ ...prev, endDate: '' }));
                                    }}
                                    maxDate={formData.endDate || undefined}
                                    error={errors.startDate}
                                />
                            </div>
                            <div className="flex-1">
                                <DatePicker
                                    label="End Date — optional"
                                    value={formData.endDate}
                                    onChange={(v) => setField('endDate', v)}
                                    minDate={formData.startDate ? (() => {
                                        const d = new Date(formData.startDate);
                                        d.setDate(d.getDate() + 1);
                                        return d.toISOString().split('T')[0];
                                    })() : undefined}
                                    error={errors.endDate}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-4 mt-8">
                        <button onClick={onClose}
                            className="flex-1 py-4 bg-[#F5F7F9] hover:bg-[#EEF1F4] text-gray-500 font-bold rounded-[18px] transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-[1.5] py-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-[18px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : mode === 'edit' ? 'Save Coupon' : 'Create Coupon'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCouponModal;
