'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMessages = messages.filter(msg =>
    msg.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    msg.phone?.includes(search) ||
    msg.message_text?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faEnvelope} className="text-aa-orange" style={{ fontSize: 32 }} />
          Inbox
        </h1>
        
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-3 text-gray-400"
            style={{ fontSize: 20 }}
          />
          <input
            type="text"
            placeholder="Search by name, phone, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon icon={faEnvelope} className="mx-auto text-gray-400 mb-2" style={{ fontSize: 48 }} />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{msg.user_name} ({msg.phone})</h3>
                  <p className="text-sm text-gray-600 mt-1">{msg.message_text}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    msg.message_type === 'incoming'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {msg.message_type}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  msg.status === 'read' ? 'bg-gray-100 text-gray-700' : 'bg-aa-orange/10 text-aa-orange'
                }`}>
                  {msg.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
