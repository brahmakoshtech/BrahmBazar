'use client';

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function SupportChat({ onClose, predefinedMessage = "Hello, I need help with my account." }) {
    const [message, setMessage] = useState(predefinedMessage);
    const [sent, setSent] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        // Simulate sending
        setSent(true);

        // In reality, this could integrate with a real chat service or just direct to WhatsApp
        // For MVP, lets simulate a "Ticket Created" state
        setTimeout(() => {
            // Optional: Redirect to WhatsApp if "Real" support needed immediately
            // window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank');
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-slideUp">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={20} />
                        <h3 className="font-bold">Live Support</h3>
                    </div>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 min-h-[400px] bg-gray-50 flex flex-col justify-between">
                    {!sent ? (
                        <>
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded text-sm text-blue-800 mb-4">
                                <p>Our support team is online! Describe your issue below so we can assist you instantly.</p>
                            </div>
                            <form onSubmit={handleSend} className="mt-auto">
                                <textarea
                                    className="w-full border border-gray-300 rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                    rows="4"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                ></textarea>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-4 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <Send size={18} /> Start Chat
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckIcon />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Message Sent!</h3>
                            <p className="text-gray-500 mt-2 text-sm">A support agent will connect with you shortly via email.</p>
                            <button
                                onClick={() => window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank')}
                                className="mt-6 text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                            >
                                Continue on WhatsApp &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
    )
}
