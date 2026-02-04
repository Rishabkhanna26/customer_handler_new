'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faMagnifyingGlass, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/common/Modal.jsx';

export default function ContactsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  const openDetails = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setMessages([]);
    setModalLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/messages`);
      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error('Failed to fetch user messages:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-aa-orange" style={{ fontSize: 32 }} />
          Contacts
        </h1>
        
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-3 text-gray-400"
            style={{ fontSize: 20 }}
          />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon icon={faUsers} className="mx-auto text-gray-400 mb-2" style={{ fontSize: 48 }} />
            <p className="text-gray-500">No contacts found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg text-gray-900 mb-2">{user.name}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-aa-orange" style={{ fontSize: 16 }} />
                  <span>{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-aa-orange" style={{ fontSize: 16 }} />
                    <span>{user.email}</span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">Assigned to: <span className="font-semibold">{user.admin_name}</span></p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex gap-2">
                <button className="flex-1 px-3 py-1 bg-aa-orange text-white rounded text-sm font-semibold hover:bg-opacity-90 transition">
                  Message
                </button>
                <button
                  className="flex-1 px-3 py-1 border border-aa-orange text-aa-orange rounded text-sm font-semibold hover:bg-aa-orange hover:text-white transition"
                  onClick={() => openDetails(user)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Contact Details"
        size="md"
      >
        {!selectedUser ? (
          <p className="text-aa-gray">No contact selected.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-aa-orange/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-aa-orange">
                  {selectedUser.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-xl font-bold text-aa-dark-blue">{selectedUser.name || 'Unknown'}</p>
                <p className="text-sm text-aa-gray">{selectedUser.admin_name ? `Assigned to ${selectedUser.admin_name}` : 'Unassigned'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-aa-gray uppercase mb-1">Phone</p>
                <p className="font-semibold text-aa-text-dark">{selectedUser.phone || '—'}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-aa-gray uppercase mb-1">Email</p>
                <p className="font-semibold text-aa-text-dark">{selectedUser.email || '—'}</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-aa-gray uppercase mb-1">Created At</p>
                <p className="font-semibold text-aa-text-dark">
                  {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : '—'}
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-xs text-aa-gray uppercase mb-1">Updated At</p>
                <p className="font-semibold text-aa-text-dark">
                  {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-aa-dark-blue mb-3">Message Details</h3>
              {modalLoading ? (
                <p className="text-aa-gray">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-aa-gray">No messages found for this contact.</p>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const latest = messages[0];
                    return (
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-xs text-aa-gray uppercase mb-1">Reason / Latest Message</p>
                        <p className="font-semibold text-aa-text-dark mb-2">{latest.message_text}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="px-2 py-1 rounded bg-gray-100 text-aa-gray">
                            Status: {latest.status || '—'}
                          </span>
                          <span className="px-2 py-1 rounded bg-gray-100 text-aa-gray">
                            Type: {latest.message_type || '—'}
                          </span>
                          <span className="px-2 py-1 rounded bg-gray-100 text-aa-gray">
                            Date: {latest.created_at ? new Date(latest.created_at).toLocaleString() : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
