'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faUsers, faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

export default function DashboardPage() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState([]);
	const [users, setUsers] = useState([]);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	async function fetchDashboardData() {
		try {
			const [statsRes, messagesRes, usersRes] = await Promise.all([
				fetch('/api/dashboard/stats'),
				fetch('/api/messages'),
				fetch('/api/users')
			]);

			const statsData = await statsRes.json();
			const messagesData = await messagesRes.json();
			const usersData = await usersRes.json();

			setStats(statsData.data);
			setMessages(messagesData.data || []);
			setUsers(usersData.data || []);
		} catch (error) {
			console.error('Failed to fetch dashboard data:', error);
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aa-orange mx-auto mb-4"></div>
					<p className="text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		);
	}

	const chartData = [
		{ name: 'Users', value: stats?.total_users || 0 },
		{ name: 'Messages', value: stats?.incoming_messages || 0 },
		{ name: 'Requirements', value: stats?.active_requirements || 0 },
		{ name: 'Open Needs', value: stats?.open_needs || 0 }
	];

	const recentMessages = messages.slice(0, 5);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Total Users</p>
							<h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_users || 0}</h3>
						</div>
						<FontAwesomeIcon icon={faUsers} className="text-aa-orange" style={{ fontSize: 40 }} />
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Incoming Messages</p>
							<h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.incoming_messages || 0}</h3>
						</div>
						<FontAwesomeIcon icon={faMessage} className="text-blue-500" style={{ fontSize: 40 }} />
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Active Requirements</p>
							<h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.active_requirements || 0}</h3>
						</div>
						<FontAwesomeIcon icon={faCircleCheck} className="text-green-500" style={{ fontSize: 40 }} />
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Open Needs</p>
							<h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.open_needs || 0}</h3>
						</div>
						<FontAwesomeIcon icon={faCircleExclamation} className="text-aa-orange" style={{ fontSize: 40 }} />
					</div>
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
					<h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="value" fill="#FF6B35" radius={[8, 8, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
					<h2 className="text-xl font-bold text-gray-900 mb-4">Growth Trend</h2>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 5 }} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
				<h2 className="text-xl font-bold text-gray-900 mb-4">Recent Messages</h2>
				<div className="space-y-3">
					{recentMessages.length === 0 ? (
						<p className="text-gray-500 text-center py-8">No recent messages</p>
					) : (
						recentMessages.map((msg) => (
							<div key={msg.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
								<div className="w-10 h-10 rounded-full bg-aa-orange/20 flex items-center justify-center flex-shrink-0">
									<span className="text-sm font-semibold text-aa-orange">{msg.user_name?.charAt(0) || 'U'}</span>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-gray-900">{msg.user_name || 'Unknown'}</p>
									<p className="text-sm text-gray-600">{msg.message_text}</p>
									<p className="text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
								</div>
								<span className={`text-xs px-2 py-1 rounded ${
									msg.message_type === 'incoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
								}`}>
									{msg.message_type}
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
