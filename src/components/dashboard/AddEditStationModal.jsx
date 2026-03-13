import React, { useState, useEffect } from 'react';
import { Fuel, Utensils } from 'lucide-react';

const AddEditStationModal = ({ isOpen, onClose, onSave, station = null, entityType = 'station' }) => {
    const cities = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
    const states = ['Telangana', 'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu'];

    const emptyForm = {
        name: '',
        address: '',
        city: 'Hyderabad',
        state: 'Telangana',
        managerName: '',
        managerPhone: '',
    };

    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const isRestaurant = entityType === 'restaurant';
    const entityName = isRestaurant ? 'Restaurant' : 'Petrol Station';

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (station) {
                setFormData({
                    name: station.name || '',
                    address: station.address || '',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    managerName: station.manager || '',
                    managerPhone: station.contact || '',
                });
            } else {
                setFormData(emptyForm);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, station]);

    if (!isOpen) return null;

    const setField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!formData.name.trim()) e.name = `${entityName} name is required.`;
        else if (formData.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';

        if (!formData.address.trim()) e.address = 'Address is required.';
        else if (formData.address.trim().length < 10) e.address = 'Please enter a more complete address.';

        if (!formData.city) e.city = 'City is required.';
        if (!formData.state) e.state = 'State is required.';

        if (formData.managerPhone && !/^\+?[0-9]{10,15}$/.test(formData.managerPhone.replace(/\s/g, '')))
            e.managerPhone = 'Enter a valid phone number (10–15 digits).';

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
        <div className="space-y-1.5">
            {label && <label className="text-[12px] font-semibold text-[#555555] ml-1">{label}</label>}
            {children}
            {error && <p className="text-[12px] text-red-500 ml-1 flex items-center gap-1 mt-1">
                <span className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center text-[9px] font-black text-red-500 flex-shrink-0">!</span>
                {error}
            </p>}
        </div>
    );

    const inputCls = (hasError) =>
        `w-full px-5 py-3.5 bg-[#F4F4F4] border rounded-[16px] text-[14px] focus:bg-white focus:outline-none focus:border-primary/20 transition-all placeholder:text-gray-400 ${hasError ? 'border-red-400 ring-2 ring-red-100' : 'border-transparent'}`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px]" onClick={onClose} />
            <div className="relative bg-white rounded-[32px] w-full max-w-[440px] shadow-2xl animate-in fade-in zoom-in duration-300 font-onest max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-[12px] bg-[#FFF5F5] flex items-center justify-center">
                            {isRestaurant ? <Utensils className="text-primary w-5 h-5" /> : <Fuel className="text-primary w-5 h-5" />}
                        </div>
                        <h2 className="text-[20px] font-bold text-dark tracking-tight">
                            {station ? `Edit ${entityName}` : `Add ${entityName}`}
                        </h2>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <Field label={`${entityName} Name *`} error={errors.name}>
                            <input
                                type="text"
                                placeholder={`Enter ${entityName.toLowerCase()} name`}
                                value={formData.name}
                                onChange={(e) => setField('name', e.target.value)}
                                className={inputCls(!!errors.name)}
                            />
                        </Field>

                        <Field label={`${entityName} Address *`} error={errors.address}>
                            <input
                                type="text"
                                placeholder="e.g. 123 Main Street, Near Station"
                                value={formData.address}
                                onChange={(e) => setField('address', e.target.value)}
                                className={inputCls(!!errors.address)}
                            />
                        </Field>

                        <div className="flex gap-4">
                            <Field label="City *" error={errors.city}>
                                <div className="relative">
                                    <select
                                        value={formData.city}
                                        onChange={(e) => setField('city', e.target.value)}
                                        className={`${inputCls(!!errors.city)} appearance-none cursor-pointer`}
                                    >
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#939393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                </div>
                            </Field>

                            <Field label="State *" error={errors.state}>
                                <div className="relative">
                                    <select
                                        value={formData.state}
                                        onChange={(e) => setField('state', e.target.value)}
                                        className={`${inputCls(!!errors.state)} appearance-none cursor-pointer`}
                                    >
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#939393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                </div>
                            </Field>
                        </div>

                        <Field label="Manager Name — optional" error={errors.managerName}>
                            <input
                                type="text"
                                placeholder="Enter manager name"
                                value={formData.managerName}
                                onChange={(e) => setField('managerName', e.target.value)}
                                className={inputCls(!!errors.managerName)}
                            />
                        </Field>

                        <Field label="Manager Phone — optional" error={errors.managerPhone}>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.managerPhone}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/[^\d+\s\-]/g, '');
                                    setField('managerPhone', v);
                                }}
                                className={inputCls(!!errors.managerPhone)}
                            />
                        </Field>
                    </div>

                    {/* Footer */}
                    <div className="flex w-full gap-4 mt-8">
                        <button onClick={onClose}
                            className="flex-1 h-[48px] rounded-[16px] bg-[#F4F4F4] text-[#2E2E2E] font-medium text-[16px] hover:bg-[#E5E5E5] transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 h-[48px] rounded-[16px] bg-[#DC0004] text-white font-medium text-[16px] hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Saving...' : station ? `Edit ${isRestaurant ? 'Restaurant' : 'Station'}` : `Add ${isRestaurant ? 'Restaurant' : 'Station'}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditStationModal;
