'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function LeadsPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  async function fetchRequirements() {
    try {
      const response = await fetch('/api/requirements', { credentials: 'include' });
      const data = await response.json();
      setRequirements(data.data || []);
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(requirementId, status) {
    const previous = requirements;
    setUpdatingId(requirementId);
    setRequirements((prev) =>
      prev.map((req) => (req.id === requirementId ? { ...req, status } : req))
    );

    try {
      const response = await fetch(`/api/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      setRequirements((prev) =>
        prev.map((req) => (req.id === requirementId ? data.data : req))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      setRequirements(previous);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.requirement_text?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faBullseye} className="text-aa-orange" style={{ fontSize: 32 }} />
          Leads
        </h1>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-3 text-gray-400"
              style={{ fontSize: 20 }}
            />
            <input
              type="text"
              placeholder="Search by name or requirement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aa-orange"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequirements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon icon={faBullseye} className="mx-auto text-gray-400 mb-2" style={{ fontSize: 48 }} />
            <p className="text-gray-500">No leads found</p>
          </div>
        ) : (
          filteredRequirements.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{req.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                    {req.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-aa-orange"
                    disabled={updatingId === req.id}
                    aria-label="Update lead status"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{req.requirement_text}</p>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">Category: </span>
                  <span className="font-semibold text-gray-700">{req.category}</span>
                </div>
                <span className="text-gray-500 text-xs">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
