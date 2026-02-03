'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Upload, Play, Loader, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReelsManager() {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);

    const fetchReels = async () => {
        try {
            const { data } = await api.get('/api/reels/admin');
            setReels(data);
        } catch (error) {
            toast.error('Failed to fetch reels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                toast.error('File too large > 20MB');
                return;
            }
            if (!file.type.startsWith('video/')) {
                toast.error('Please upload a video file');
                return;
            }
            setVideoFile(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) return;

        const formData = new FormData();
        formData.append('video', videoFile);
        if (title) formData.append('title', title);

        setUploading(true);
        try {
            await api.post('/api/reels/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Reel uploaded successfully!');
            setTitle('');
            setVideoFile(null);
            fetchReels();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this reel?')) return;
        try {
            await api.delete(`/api/reels/${id}`);
            toast.success('Reel deleted');
            setReels(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const { data } = await api.patch(`/api/reels/${id}/toggle`);
            setReels(prev => prev.map(r => r._id === id ? { ...r, isActive: data.isActive } : r));
            toast.success(data.isActive ? 'Reel activated' : 'Reel deactivated');
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-gray-800">Reels Manager</h1>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-orange-500" />
                    Upload New Reel
                </h2>
                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-gray-600 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Sacred Rudraksha Ritual"
                        />
                    </div>
                    <div className="flex-1 w-full relative">
                        <label className="block text-sm font-bold text-gray-600 mb-1">Video File (MP4/WebM, Max 20MB)</label>
                        <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-orange-50 file:text-orange-700
                                hover:file:bg-orange-100"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!videoFile || uploading}
                        className={`px-6 py-2 rounded-full font-bold text-white transition-all
                            ${!videoFile || uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-lg'}
                        `}
                    >
                        {uploading ? 'Uploading...' : 'Upload Reel'}
                    </button>
                </form>
            </div>

            {/* Reels List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Play size={20} className="text-orange-500" />
                    Existing Reels ({reels.length})
                </h2>

                {loading ? (
                    <div className="flex justify-center py-10"><Loader className="animate-spin text-orange-500" /></div>
                ) : reels.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No reels uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {reels.map((reel) => (
                            <div key={reel._id} className="relative group bg-black rounded-lg overflow-hidden aspect-[3/4] shadow-sm border border-gray-100 hover:border-orange-500 transition-all">
                                <video src={reel.videoUrl} className="w-full h-full object-cover opacity-80" />

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                    <p className="text-white font-bold truncate text-sm">{reel.title || 'Untitled Reel'}</p>
                                    <p className="text-[10px] text-gray-300">{new Date(reel.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="absolute top-2 right-2 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(reel._id)}
                                        className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all ${reel.isActive ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-gray-200'}`}
                                        title={reel.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {reel.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reel._id)}
                                        className="p-2 bg-red-500/80 text-white rounded-full backdrop-blur-md hover:bg-red-600 shadow-lg"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
