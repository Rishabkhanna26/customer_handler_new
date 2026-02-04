'use client';
import { useEffect, useState } from 'react';
import Card from '../components/common/Card.jsx';
import Loader from '../components/common/Loader.jsx';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faChartLine,
  faUsers,
  faMessage,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../components/common/Button.jsx';
import { reportService } from '../../lib/mock-services.js';

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportService.getOverview();
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader size="lg" text="Loading reports..." />
      </div>
    );
  }

  const messageChartData = reports?.messageStats?.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    messages: stat.count
  })) || [];

  const leadChartData = reports?.leadStats?.map(stat => ({
    name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
    value: stat.count
  })) || [];

  const COLORS = ['#FF6B00', '#0A1F44', '#4CAF50', '#FFC107', '#F44336', '#2196F3'];

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-aa-dark-blue mb-2">Reports & Analytics</h1>
          <p className="text-aa-gray">Track your business performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <Button
            variant="outline"
            icon={<FontAwesomeIcon icon={faDownload} style={{ fontSize: 18 }} />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-aa-gray text-sm font-semibold mb-1">Total Messages</p>
              <h3 className="text-3xl font-bold text-aa-dark-blue">
                {messageChartData.reduce((sum, item) => sum + item.messages, 0)}
              </h3>
              <p className="text-sm text-green-600 font-semibold mt-1">↑ 12.5%</p>
            </div>
            <div className="w-12 h-12 bg-aa-orange/10 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faMessage} className="text-aa-orange" style={{ fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-aa-gray text-sm font-semibold mb-1">Total Leads</p>
              <h3 className="text-3xl font-bold text-aa-dark-blue">
                {leadChartData.reduce((sum, item) => sum + item.value, 0)}
              </h3>
              <p className="text-sm text-green-600 font-semibold mt-1">↑ 23.1%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faBullseye} className="text-aa-dark-blue" style={{ fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-aa-gray text-sm font-semibold mb-1">Conversion Rate</p>
              <h3 className="text-3xl font-bold text-aa-dark-blue">32.5%</h3>
              <p className="text-sm text-green-600 font-semibold mt-1">↑ 5.2%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600" style={{ fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-aa-gray text-sm font-semibold mb-1">Active Agents</p>
              <h3 className="text-3xl font-bold text-aa-dark-blue">
                {reports?.agentPerformance?.length || 0}
              </h3>
              <p className="text-sm text-aa-gray font-semibold mt-1">Available</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUsers} className="text-yellow-600" style={{ fontSize: 24 }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Timeline */}
        <Card>
          <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Messages Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={messageChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="messages" 
                stroke="#FF6B00" 
                strokeWidth={3} 
                dot={{ fill: '#FF6B00', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Leads Distribution */}
        <Card>
          <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {leadChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Agent Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Agent</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Active Chats</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Messages Sent</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Response Time</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Resolution Rate</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-aa-gray uppercase">Rating</th>
              </tr>
            </thead>
            <tbody>
              {reports?.agentPerformance?.map((agent, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-aa-dark-blue flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {agent.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <span className="font-semibold text-aa-text-dark">{agent.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-aa-dark-blue">{agent.active_chats}</td>
                  <td className="py-4 px-4 font-semibold text-aa-orange">{agent.messages_sent}</td>
                  <td className="py-4 px-4 text-aa-gray">2.5 mins</td>
                  <td className="py-4 px-4">
                    <span className="text-green-600 font-semibold">85%</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-yellow-600 font-semibold">★ 4.7</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Top Campaigns</h3>
          <div className="space-y-4">
            {['New Year Sale', 'Product Launch', 'Summer Offer'].map((campaign, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-aa-text-dark">{campaign}</p>
                  <p className="text-xs text-aa-gray mt-1">Sent to 500 contacts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-aa-orange">45%</p>
                  <p className="text-xs text-aa-gray">Open Rate</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Revenue by Source</h3>
          <div className="space-y-4">
            {[
              { source: 'WhatsApp', revenue: '$45,000', percentage: 45, color: 'bg-aa-orange' },
              { source: 'Website', revenue: '$30,000', percentage: 30, color: 'bg-aa-dark-blue' },
              { source: 'Referral', revenue: '$15,000', percentage: 15, color: 'bg-green-500' },
              { source: 'Other', revenue: '$10,000', percentage: 10, color: 'bg-gray-400' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-aa-text-dark">{item.source}</span>
                  <span className="text-sm font-bold text-aa-orange">{item.revenue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
