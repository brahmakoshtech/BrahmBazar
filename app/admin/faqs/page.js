'use client';

import { useState, useEffect } from 'react';
import { getAdminFaqs, createFaq, updateFaq, deleteFaq, seedFaqs as seedFaqsApi } from '@/services/faqService';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFaqsPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFaq, setCurrentFaq] = useState(null);
    const [formData, setFormData] = useState({ question: '', answer: '', isActive: true });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const data = await getAdminFaqs();
            setFaqs(data);
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentFaq) {
                await updateFaq(currentFaq._id, formData);
                toast.success('FAQ updated successfully');
            } else {
                await createFaq(formData);
                toast.success('FAQ created successfully');
            }
            setIsModalOpen(false);
            fetchFaqs();
            resetForm();
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            toast.error('Failed to save FAQ');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await deleteFaq(id);
                toast.success('FAQ deleted successfully');
                fetchFaqs();
            } catch (error) {
                console.error('Failed to delete FAQ:', error);
                toast.error('Failed to delete FAQ');
            }
        }
    };

    const handleSeed = async () => {
        if (confirm('This will delete all existing FAQs and reset to default. Continue?')) {
            try {
                await seedFaqsApi();
                toast.success('FAQs reset to default');
                fetchFaqs();
            } catch (error) {
                console.error('Failed to seed FAQs:', error);
                toast.error('Failed to seed FAQs');
            }
        }
    }

    const startEdit = (faq) => {
        setCurrentFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer, isActive: faq.isActive });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setCurrentFaq(null);
        setFormData({ question: '', answer: '', isActive: true });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">FAQ Management</h1>
                    <p className="text-muted-foreground mt-1">Manage common questions and answers</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSeed}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                        <Plus size={20} /> Add New FAQ
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {faqs.map((faq) => (
                        <div key={faq._id} className="bg-card border border-border p-6 rounded-xl flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-serif font-medium text-lg">{faq.question}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs border ${faq.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {faq.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">{faq.answer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => startEdit(faq)}
                                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(faq._id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {faqs.length === 0 && (
                        <div className="text-center py-20 bg-muted/50 rounded-xl border border-dashed border-border">
                            <p className="text-muted-foreground">No FAQs found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border p-6">
                        <h2 className="text-2xl font-serif font-bold mb-6">
                            {currentFaq ? 'Edit FAQ' : 'Add New FAQ'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Question</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Answer</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors resize-none"
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-medium">
                                    {formData.isActive ? 'Active (Visible to users)' : 'Inactive (Hidden)'}
                                </span>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                >
                                    {currentFaq ? 'Update FAQ' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
