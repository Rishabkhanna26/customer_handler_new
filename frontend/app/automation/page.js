'use client';
import { useState } from 'react';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Input from '../components/common/Input.jsx';
import Modal from '../components/common/Modal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBolt,
  faMessage,
  faClock,
  faBullseye,
  faToggleOff,
  faToggleOn,
} from '@fortawesome/free-solid-svg-icons';

export default function AutomationPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Welcome Message',
      type: 'auto-reply',
      trigger: 'New contact message',
      action: 'Send welcome template',
      isActive: true
    },
    {
      id: 2,
      name: 'Business Hours Reply',
      type: 'auto-reply',
      trigger: 'Message outside hours',
      action: 'Send away message',
      isActive: true
    },
    {
      id: 3,
      name: 'Lead Assignment',
      type: 'workflow',
      trigger: 'New lead created',
      action: 'Assign to agent',
      isActive: false
    },
    {
      id: 4,
      name: 'Follow-up Reminder',
      type: 'reminder',
      trigger: 'Follow-up date reached',
      action: 'Send notification',
      isActive: true
    }
  ]);

  const toggleAutomation = (id) => {
    setAutomations(automations.map(auto =>
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ));
  };

  return (
    <div className="space-y-6" data-testid="automation-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-aa-dark-blue mb-2">Automation</h1>
          <p className="text-aa-gray">Automate your workflows and responses</p>
        </div>
        <Button
          variant="primary"
          icon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 18 }} />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Rule
        </Button>
      </div>

      {/* Automation Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Auto Replies', count: 5, icon: faMessage, color: 'bg-aa-orange' },
          { title: 'Workflows', count: 3, icon: faBolt, color: 'bg-aa-dark-blue' },
          { title: 'Reminders', count: 2, icon: faClock, color: 'bg-green-500' },
          { title: 'Triggers', count: 8, icon: faBullseye, color: 'bg-yellow-500' }
        ].map((type, idx) => {
          return (
            <Card key={idx}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aa-gray text-sm font-semibold mb-1">{type.title}</p>
                  <h3 className="text-2xl font-bold text-aa-dark-blue">{type.count}</h3>
                </div>
                <div className={`${type.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <FontAwesomeIcon icon={type.icon} className="text-white" style={{ fontSize: 24 }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Automations */}
      <Card>
        <h3 className="text-xl font-bold text-aa-dark-blue mb-4">Active Automations</h3>
        <div className="space-y-4">
          {automations.map(automation => (
            <div
              key={automation.id}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-aa-orange"
              data-testid={`automation-${automation.id}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  automation.isActive ? 'bg-aa-orange/10' : 'bg-gray-100'
                }`}>
                  <FontAwesomeIcon
                    icon={faBolt}
                    className={automation.isActive ? 'text-aa-orange' : 'text-aa-gray'}
                    style={{ fontSize: 24 }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-aa-text-dark">{automation.name}</h4>
                    <Badge variant={automation.isActive ? 'green' : 'default'}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-aa-gray">
                    <span className="font-semibold">IF</span> {automation.trigger} →{' '}
                    <span className="font-semibold">THEN</span> {automation.action}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleAutomation(automation.id)}
                  className="text-aa-orange hover:text-aa-dark-blue"
                  data-testid={`toggle-automation-${automation.id}`}
                >
                  {automation.isActive ? (
                    <FontAwesomeIcon icon={faToggleOn} style={{ fontSize: 32 }} />
                  ) : (
                    <FontAwesomeIcon icon={faToggleOff} style={{ fontSize: 32 }} />
                  )}
                </button>
                <Button variant="outline" className="text-sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Reply */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-aa-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faMessage} className="text-aa-orange" style={{ fontSize: 24 }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-aa-dark-blue mb-1">Auto Reply</h3>
              <p className="text-sm text-aa-gray">Automatically respond to messages based on keywords</p>
            </div>
          </div>
          <div className="space-y-3">
            <Input placeholder="Keyword (e.g., pricing, hello)" />
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange"
              rows="3"
              placeholder="Reply message..."
            ></textarea>
            <Button variant="primary" className="w-full">Create Auto Reply</Button>
          </div>
        </Card>

        {/* Welcome Message */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-aa-dark-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBullseye} className="text-aa-dark-blue" style={{ fontSize: 24 }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-aa-dark-blue mb-1">Welcome Message</h3>
              <p className="text-sm text-aa-gray">Send welcome message to new contacts</p>
            </div>
          </div>
          <div className="space-y-3">
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange"
              rows="3"
              placeholder="Welcome message..."
              defaultValue="Hello! Welcome to AlgoAura. How can we help you today?"
            ></textarea>
            <div className="flex items-center justify-between">
              <span className="text-sm text-aa-gray">Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aa-orange"></div>
              </label>
            </div>
            <Button variant="primary" className="w-full">Update Welcome Message</Button>
          </div>
        </Card>

        {/* Business Hours */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faClock} className="text-green-600" style={{ fontSize: 24 }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-aa-dark-blue mb-1">Business Hours</h3>
              <p className="text-sm text-aa-gray">Set your availability and auto-reply for off-hours</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Time" type="time" defaultValue="09:00" />
              <Input label="End Time" type="time" defaultValue="18:00" />
            </div>
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange"
              rows="3"
              placeholder="Off-hours message..."
              defaultValue="Thanks for reaching out! We're currently offline. Our business hours are 9 AM - 6 PM."
            ></textarea>
            <Button variant="primary" className="w-full">Save Settings</Button>
          </div>
        </Card>

        {/* Chatbot */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBolt} className="text-yellow-600" style={{ fontSize: 24 }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-aa-dark-blue mb-1">AI Chatbot</h3>
              <p className="text-sm text-aa-gray">Let AI handle common queries automatically</p>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <p className="text-sm text-aa-dark-blue mb-2">
              <span className="font-semibold">Status:</span> Coming Soon
            </p>
            <p className="text-xs text-aa-gray">
              AI-powered chatbot will be available in the next update
            </p>
          </div>
          <Button variant="outline" className="w-full" disabled>
            Configure Chatbot
          </Button>
        </Card>
      </div>

      {/* Create Automation Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Automation Rule">
        <form className="space-y-4">
          <Input label="Rule Name" placeholder="Enter rule name" required />
          
          <div>
            <label className="block text-sm font-semibold text-aa-text-dark mb-2">Trigger Type</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange">
              <option>Select trigger type</option>
              <option>New message received</option>
              <option>Keyword detected</option>
              <option>New contact added</option>
              <option>Lead status changed</option>
              <option>Time-based trigger</option>
            </select>
          </div>

          <Input label="Trigger Value" placeholder="Enter trigger value (e.g., keyword)" />

          <div>
            <label className="block text-sm font-semibold text-aa-text-dark mb-2">Action Type</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange">
              <option>Select action type</option>
              <option>Send message</option>
              <option>Send template</option>
              <option>Assign to agent</option>
              <option>Create lead</option>
              <option>Send notification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-aa-text-dark mb-2">Action Value</label>
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-aa-orange"
              rows="3"
              placeholder="Enter action details..."
            ></textarea>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" className="flex-1">Create Rule</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
