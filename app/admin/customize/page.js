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
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Sanctuary Scribe</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Fine-tune the sacred inscriptions of your digital temple.</p>
                </div>
                <button
                    onClick={handleSeed}
                    className="bg-white/60 backdrop-blur-md hover:bg-foreground hover:text-white text-foreground px-6 py-3 rounded-full border border-primary/10 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                    Restore Primal Word
                </button>
            </div>

            <div className="space-y-16">
                {Object.entries(groupedBlocks).map(([section, blocks]) => (
                    <div key={section} className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-primary/10 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-primary/30"></span>
                            {section.replace('_', ' ')}
                            <span className="flex-1 h-[1px] bg-primary/30"></span>
                        </h2>

                        <div className="grid gap-6">
                            {blocks.map((block) => (
                                <div key={block._id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white/50 p-6 rounded-[2rem] border border-primary/5 hover:border-primary/20 transition-all group">
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{block.title}</label>
                                        <span className="text-[9px] text-primary/40 font-mono font-bold">/{block.identifier}</span>
                                    </div>

                                    <div className="md:col-span-8">
                                        {editingId === block.identifier ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full bg-white border border-primary/20 rounded-xl px-5 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium text-sm transition-all shadow-inner"
                                                autoFocus
                                            />
                                        ) : (
                                            <p className="text-foreground text-sm font-medium bg-background/30 px-5 py-3 rounded-xl border border-primary/5 italic truncate">
                                                "{block.content}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-1 flex justify-end gap-2">
                                        {editingId === block.identifier ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(block.identifier)}
                                                    disabled={saving}
                                                    className="p-3 bg-primary text-white rounded-full hover:bg-foreground transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                                >
                                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-3 bg-white text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-lg border border-primary/5"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(block)}
                                                className="p-4 bg-white text-muted-foreground rounded-full hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100 shadow-md border border-primary/5"
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
