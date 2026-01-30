'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api'; // Ensure this points to your axios instance
import { Save, Loader2, Edit3, Check, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CustomizeSite() {
    const [contentBlocks, setContentBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const { data } = await api.get('/api/content/admin');
            setContentBlocks(data);
        } catch (error) {
            console.error('Failed to fetch content:', error);
            showError('Failed to load content settings');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (block) => {
        setEditingId(block.identifier);
        setEditValue(block.content);
    };

    const handleSave = async (identifier) => {
        setSaving(true);
        try {
            await api.put(`/api/content/${identifier}`, { content: editValue });

            // Update local state
            setContentBlocks(prev => prev.map(block =>
                block.identifier === identifier ? { ...block, content: editValue } : block
            ));

            success('Updated successfully');
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update content:', error);
            showError('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    // Group blocks by section
    const groupedBlocks = contentBlocks.reduce((acc, block) => {
        const section = block.section || 'Other';
        if (!acc[section]) acc[section] = [];
        acc[section].push(block);
        return acc;
    }, {});

    const handleSeed = async () => {
        if (!confirm('This will restore default content blocks if they are missing. Continue?')) return;
        setLoading(true);
        try {
            const { data } = await api.post('/api/content/seed');
            success(data.message);
            fetchContent(); // Refresh list
        } catch (error) {
            console.error('Failed to seed content:', error);
            showError('Failed to seed defaults');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-primary">Customize Site Content</h1>
                <button
                    onClick={handleSeed}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded border border-white/10 text-sm transition-colors"
                >
                    Reset/Seed Defaults
                </button>
            </div>

            <div className="space-y-12">
                {Object.entries(groupedBlocks).map(([section, blocks]) => (
                    <div key={section} className="bg-neutral-900/50 p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-white/10 pb-2">
                            {section.replace('_', ' ')}
                        </h2>

                        <div className="grid gap-6">
                            {blocks.map((block) => (
                                <div key={block._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-black/40 p-4 rounded-lg">
                                    <div className="md:col-span-3">
                                        <label className="text-sm font-medium text-gray-300 block">{block.title}</label>
                                        <span className="text-xs text-gray-600 font-mono">{block.identifier}</span>
                                    </div>

                                    <div className="md:col-span-8">
                                        {editingId === block.identifier ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full bg-neutral-800 border border-primary/50 rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-white/90 text-sm truncate bg-neutral-900/50 px-3 py-2 rounded">{block.content}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-1 flex justify-end gap-2">
                                        {editingId === block.identifier ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(block.identifier)}
                                                    disabled={saving}
                                                    className="p-2 bg-primary text-black rounded hover:bg-white transition disabled:opacity-50"
                                                >
                                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 bg-neutral-700 text-white rounded hover:bg-neutral-600 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(block)}
                                                className="p-2 bg-neutral-800 text-gray-400 rounded hover:text-white hover:bg-neutral-700 transition"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
