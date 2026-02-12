'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Edit2, Trash2, MapPin, Check, Plus, Star } from 'lucide-react';

export default function AddressManager({ mode = 'manage', onSelect, selectedId, isSidebar = false }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        isDefault: false
    });

    const fetchAddresses = async (selectId = null) => {
        try {
            // Using the specialized list endpoint
            const { data } = await api.get('/api/user/address/list');
            setAddresses(data);

            // Auto-select logic for 'select' mode
            if (mode === 'select') {
                if (selectId) {
                    onSelect && onSelect(selectId);
                } else if (!selectedId && data.length > 0) {
                    const defaultAddr = data.find(a => a.isDefault) || data[0];
                    if (defaultAddr) onSelect && onSelect(defaultAddr._id);
                }
            }
        } catch (err) {
            console.error("Failed to fetch addresses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/api/user/address/delete/${id}`);
            if (mode === 'select' && selectedId === id) {
                onSelect && onSelect(null);
            }
            fetchAddresses();
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const handleSetDefault = async (e, id) => {
        e.stopPropagation();
        try {
            await api.patch(`/api/user/address/set-default/${id}`);
            fetchAddresses();
        } catch (err) {
            alert('Failed to set default address');
        }
    };

    const handleEdit = (e, addr) => {
        e.stopPropagation();
        setFormData({
            fullName: addr.fullName,
            address: addr.addressLine1,
            addressLine2: addr.addressLine2 || '',
            city: addr.city,
            state: addr.state,
            postalCode: addr.pincode,
            country: addr.country || 'India',
            phone: addr.phone,
            isDefault: addr.isDefault || false
        });
        setEditingAddressId(addr._id);
        setIsNewAddress(true);
    };

    const handleCancel = () => {
        setIsNewAddress(false);
        setEditingAddressId(null);
        setFormData({ fullName: '', address: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', phone: '', isDefault: false });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                fullName: formData.fullName,
                phone: formData.phone,
                addressLine1: formData.address,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                pincode: formData.postalCode,
                country: formData.country || 'India',
                isDefault: formData.isDefault
            };

            let savedId;
            if (editingAddressId) {
                const { data } = await api.put(`/api/user/address/update/${editingAddressId}`, payload);
                savedId = data._id;
                setEditingAddressId(null);
            } else {
                // If it's the first address, backend handles default assignment, but we can also suggest it
                const { data } = await api.post('/api/user/address/add', payload);
                savedId = data._id;
            }

            await fetchAddresses(savedId);
            setIsNewAddress(false);
            setFormData({ fullName: '', address: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', phone: '', isDefault: false });

        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-sm text-muted-foreground">Loading addresses...</div>;

    return (
        <div className="space-y-4">

            {/* ADDRESS LIST */}
            {addresses.length > 0 && !editingAddressId && (
                <div className={`grid grid-cols-1 ${mode === 'manage' && !isSidebar ? 'md:grid-cols-2 lg:grid-cols-2' : ''} gap-3`}>
                    {addresses.map((addr) => (
                        <div
                            key={addr._id}
                            onClick={() => {
                                if (mode === 'select') {
                                    onSelect && onSelect(addr._id);
                                    setIsNewAddress(false);
                                }
                            }}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-200 group
                                ${mode === 'select'
                                    ? 'cursor-pointer hover:border-primary/50'
                                    : 'bg-white/40 backdrop-blur-md hover:shadow-md'
                                }
                                ${mode === 'select' && selectedId === addr._id
                                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                    : 'border-primary/10'
                                }
                            `}
                        >
                            {/* Selection Indicator for Checkout */}
                            {mode === 'select' && (
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedId === addr._id ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                                    {selectedId === addr._id && <Check size={12} strokeWidth={4} />}
                                </div>
                            )}

                            {/* Default Badge - Compact for Sidebar */}
                            {addr.isDefault && (
                                <span className={`
                                    inline-flex items-center gap-1 rounded-full bg-secondary/10 text-secondary font-black uppercase tracking-widest border border-secondary/20
                                    ${isSidebar ? 'absolute top-3 right-3 px-1.5 py-0.5 text-[7px]' : 'mb-2 px-2 py-0.5 text-[9px]'}
                                `}>
                                    <Star size={isSidebar ? 6 : 8} fill="currentColor" /> {isSidebar ? 'Def' : 'Default'}
                                </span>
                            )}

                            <div className={`${isSidebar ? 'pr-0' : 'pr-8'}`}>
                                <h3 className={`font-bold text-foreground flex items-center gap-2 ${isSidebar ? 'text-xs' : 'text-sm'}`}>
                                    {addr.fullName}
                                </h3>
                                <p className={`font-bold text-muted-foreground mt-0.5 ${isSidebar ? 'text-[10px]' : 'text-xs'}`}>{addr.phone}</p>

                                <p className={`text-foreground/80 mt-1 leading-relaxed ${isSidebar ? 'text-[10px] line-clamp-2' : 'text-xs text-foreground/80 mt-2 leading-relaxed'}`}>
                                    {addr.addressLine1}
                                    {addr.addressLine2 && <>, {addr.addressLine2}</>}
                                    {isSidebar ? '' : <br />}
                                    {isSidebar ? ', ' : ''}
                                    {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                                </p>
                            </div>

                            {/* Action Buttons - Compact for Sidebar (Absolute positioned) */}
                            {isSidebar ? (
                                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-primary/5">
                                    {!addr.isDefault && (
                                        <button
                                            onClick={(e) => handleSetDefault(e, addr._id)}
                                            className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mr-auto"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleEdit(e, addr)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        title="Edit Address"
                                    >
                                        <Edit2 size={10} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, addr._id)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                        title="Delete Address"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ) : (
                                /* Standard Action Buttons */
                                <div className={`
                                    flex items-center gap-2 mt-4 pt-3 border-t border-primary/5
                                    ${mode === 'select' ? 'justify-end' : 'justify-between'}
                                `}>
                                    {mode === 'manage' && !addr.isDefault && (
                                        <button
                                            onClick={(e) => handleSetDefault(e, addr._id)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Set Default
                                        </button>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => handleEdit(e, addr)}
                                            className="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors"
                                            title="Edit Address"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, addr._id)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete Address"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ADD NEW ADDRESS BUTTON */}
            {!isNewAddress && !editingAddressId && (
                <button
                    onClick={() => {
                        setIsNewAddress(true);
                        setEditingAddressId(null);
                        setFormData({ fullName: '', address: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', phone: '', isDefault: false });
                        if (mode === 'select') onSelect && onSelect(null);
                    }}
                    className={`
                        w-full rounded-xl border border-dashed border-primary/30 
                        flex items-center justify-center gap-2 
                        text-primary hover:bg-primary/5 transition-colors group
                        ${isSidebar ? 'p-2.5 text-xs' : 'p-4 text-sm'}
                        ${addresses.length === 0 ? 'py-8' : ''}
                    `}
                >
                    <div className={`rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform ${isSidebar ? 'w-5 h-5' : 'w-8 h-8'}`}>
                        <Plus size={isSidebar ? 12 : 16} />
                    </div>
                    <span className="font-bold uppercase tracking-wide">Add New Address</span>
                </button>
            )}

            {/* FORM (Add / Edit) */}
            {(isNewAddress || editingAddressId) && (
                <div className="bg-white/60 backdrop-blur-md p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-primary/5">
                        <h3 className="font-serif font-bold text-foreground">
                            {editingAddressId ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="col-span-2">
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Full Name</label>
                            <input
                                required
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="Enter Full Name"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="+91 99999 99999"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Address Line 1</label>
                            <input
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="House No, Building, Street"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Address Line 2 (Optional)</label>
                            <input
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="Landmark, Area"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">City</label>
                            <input
                                required
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="City"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">State</label>
                            <input
                                required
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="State"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Pincode</label>
                            <input
                                required
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-white/50 border border-primary/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/50"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <label className="block text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                readOnly
                                className="w-full px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm rounded-lg bg-gray-100 border border-transparent text-muted-foreground cursor-not-allowed font-medium"
                            />
                        </div>

                        {mode === 'manage' && (
                            <div className="col-span-2 pt-1 md:pt-2">
                                <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-primary border-primary text-white' : 'bg-white border-primary/20 group-hover:border-primary'}`}>
                                        {formData.isDefault && <Check size={12} className="md:w-[14px] md:h-[14px]" strokeWidth={3} />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={formData.isDefault}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <span className="text-xs md:text-sm font-medium text-foreground">Set as default address</span>
                                </label>
                            </div>
                        )}

                        <div className="col-span-2 flex gap-2 md:gap-3 pt-3 md:pt-4 border-t border-primary/5 mt-1 md:mt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-bold text-muted-foreground border border-primary/10 hover:bg-white hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] bg-primary text-white py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <span className="animate-pulse">Saving...</span>
                                ) : (
                                    <>
                                        <Check size={16} className="md:w-[18px] md:h-[18px]" />
                                        Save Address
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
