import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your Mysuru travel assistant. Ask me anything about places to visit, local culture, food recommendations, or travel tips! 🌟'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Add user message to chat
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Call our secure backend API instead of OpenAI directly
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: newMessages
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Chat API Error:', errorData);
                throw new Error(errorData.error || 'Failed to get response from ChatGPT');
            }

            const data = await response.json();
            const assistantMessage = data.message;

            setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('ChatGPT Error:', error);

            // More detailed error message
            let errorMessage = '⚠️ Sorry, I encountered an error. ';

            if (error.message.includes('Incorrect API key')) {
                errorMessage += 'Your OpenAI API key appears to be invalid. Please check your .env file.';
            } else if (error.message.includes('quota')) {
                errorMessage += 'You have exceeded your OpenAI API quota. Please check your billing settings.';
            } else if (error.message.includes('rate_limit')) {
                errorMessage += 'Rate limit exceeded. Please wait a moment and try again.';
            } else {
                errorMessage += `Error: ${error.message}. Please make sure your OpenAI API key is configured correctly in the .env file.`;
            }

            setMessages([
                ...newMessages,
                {
                    role: 'assistant',
                    content: errorMessage
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999] w-[380px] h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Mysuru Assistant</h3>
                                <p className="text-white/80 text-[10px]">Powered by ChatGPT</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-[#D4AF37] text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <p
                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(message.content, {
                                                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
                                                ALLOWED_ATTR: []
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3">
                                    <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about Mysuru..."
                                className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 max-h-24"
                                rows="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-10 h-10 bg-[#D4AF37] hover:bg-[#B8941F] disabled:bg-gray-300 dark:disabled:bg-gray-700 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 text-center">
                            AI responses may vary. Always verify travel information.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
