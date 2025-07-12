import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../common/Toast';
import { Table, Button, StatusBadge, Modal, Input, Card } from '../ui';
import { agentsApi } from '../../services/api';
import type { TableColumn, Agent } from '../../types';
import { Plus, Edit, Trash2, Shield, ShieldOff, Activity, Eye } from 'lucide-react';

const AgentManagement: React.FC = () => {
  const { agents, transactions, deleteAgent, blockAgent, unblockAgent } = useData();
  const { showSuccess, showError, showInfo } = useToast();


  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [newAgent, setNewAgent] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

  const columns: TableColumn<Agent>[] = [
    {
      key: 'id',
      label: 'Agent ID',
      sortable: true
    },
    {
      key: 'firstName',
      label: 'Name',
      render: (_, agent) => `${agent.firstName} ${agent.lastName}`,
      sortable: true
    },
    {
      key: 'mobile',
      label: 'Mobile',
      sortable: true
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true
    },

    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <StatusBadge status={status}>
          {status.toUpperCase()}
        </StatusBadge>
      )
    },
    {
      key: 'lastLocation',
      label: 'Last Location'
    },
    {
      key: 'paymentsToday',
      label: 'Payments Today',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, agent) => (
        <div className="flex space-x-1 min-w-[200px]">
          {/* Read/View Button */}
            <Button
              variant="info"
              size="sm"
              onClick={() => handleViewAgent(agent)}
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {/* Update/Edit Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingAgent(agent);
                setEditPassword(''); // Reset password field
              }}
              title="Edit Agent"
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteAgent(agent.id)}
              title="Delete Agent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

          {/* Additional Actions */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => viewAgentActivity(agent.id)}
            title="View Activity"
          >
            <Activity className="w-4 h-4" />
          </Button>

          {/* Block/Unblock Button */}
          {agent.status === 'active' ? (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleBlockAgent(agent.id)}
              title="Block Agent"
            >
              <ShieldOff className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUnblockAgent(agent.id)}
              title="Unblock Agent"
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleAddAgent = async () => {
    if (newAgent.firstName && newAgent.lastName && newAgent.mobile && newAgent.password) {
      setLoading(true);
      try {
        console.log('Creating agent with data:', newAgent);
        const response = await agentsApi.create({
          firstName: newAgent.firstName,
          lastName: newAgent.lastName,
          mobile: newAgent.mobile,
          password: newAgent.password
        });

        console.log('Agent created successfully:', response);
        showSuccess('Agent created successfully!', `Mobile: ${newAgent.mobile}\nPassword: ${newAgent.password}\n\nPlease provide these credentials to the agent manually.`);

        // Reset form
        setNewAgent({
          firstName: '',
          lastName: '',
          mobile: '',
          password: ''
        });

        // Agent created successfully

      } catch (error) {
        console.error('Error creating agent:', error);
        showError('Failed to create agent', 'Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      showError('Missing information', 'Please fill in all required fields.');
    }
  };

  const handleEditAgent = async () => {
    if (editingAgent) {
      setLoading(true);
      try {
        const updateData: any = {
          firstName: editingAgent.firstName,
          lastName: editingAgent.lastName,
          mobile: editingAgent.mobile
        };

        // Only include password if it's provided
        if (editPassword && editPassword.trim() !== '') {
          updateData.password = editPassword;
        }

        const response = await agentsApi.update(editingAgent.id, updateData);

        console.log('Agent updated successfully:', response);

        if (editPassword && editPassword.trim() !== '') {
          showSuccess('Agent updated successfully!', `New password: ${editPassword}\n\nPlease provide the new password to the agent manually.`);
        } else {
          showSuccess('Agent updated successfully!');
        }

        setEditingAgent(null);
        setEditPassword('');

      } catch (error) {
        console.error('Error updating agent:', error);
        showError('Failed to update agent', 'Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        console.log('Deleting agent:', agentId);
        await deleteAgent(agentId);
        showSuccess('Agent deleted successfully!');
      } catch (error) {
        console.error('Error deleting agent:', error);
        showError('Failed to delete agent', 'Please try again.');
      }
    }
  };

  const viewAgentActivity = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    const agentTransactions = transactions.filter(t =>
      (t.agent && t.agent.includes(agent?.username || agentId)) ||
      t.agentId === agentId
    );

    const message = agentTransactions.length > 0 ?
      `Recent transactions:\n${agentTransactions.slice(-5).map(t =>
        `${t.timestamp || new Date(t.createdAt).toLocaleString()}: ${t.user || `User ${t.userId}`}`
      ).join('\n')}` :
      'No transactions found for this agent.';

    showInfo('Agent Activity', message);
  };

  // Handler functions for CRUD operations
  const handleViewAgent = (agent: Agent) => {
    setViewingAgent(agent);
  };



  const handleBlockAgent = async (agentId: string) => {
    try {
      await blockAgent(agentId);
      showSuccess('Agent blocked successfully!');
    } catch (error) {
      console.error('Error blocking agent:', error);
      showError('Failed to block agent', 'Please try again.');
    }
  };

  const handleUnblockAgent = async (agentId: string) => {
    try {
      await unblockAgent(agentId);
      showSuccess('Agent unblocked successfully!');
    } catch (error) {
      console.error('Error unblocking agent:', error);
      showError('Failed to unblock agent', 'Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Management</h1>
        <p className="text-gray-600">Manage field agents and their access</p>
      </div>

      {/* Add Agent Form */}
      <Card>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Add New Agent</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="First Name"
              value={newAgent.firstName}
              onChange={(value) => setNewAgent({ ...newAgent, firstName: value })}
            />
            <Input
              placeholder="Last Name"
              value={newAgent.lastName}
              onChange={(value) => setNewAgent({ ...newAgent, lastName: value })}
            />
            <Input
              placeholder="Mobile Number"
              value={newAgent.mobile}
              onChange={(value) => setNewAgent({ ...newAgent, mobile: value })}
            />
            <Input
              placeholder="Password"
              type="password"
              value={newAgent.password}
              onChange={(value) => setNewAgent({ ...newAgent, password: value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The mobile number and password you enter will be displayed after creation. Please provide these credentials to the agent manually.
            </p>
          </div>

          <Button
            variant="success"
            onClick={handleAddAgent}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </Card>

      {/* Agents Table */}
      <Table
        data={agents}
        columns={columns}
        searchable
        searchPlaceholder="Search agents..."
      />

      {/* Edit Agent Modal */}
      <Modal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        title="Edit Agent"
      >
        {editingAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={editingAgent.firstName}
                onChange={(value) => setEditingAgent({ ...editingAgent, firstName: value })}
                required
              />
              <Input
                label="Last Name"
                value={editingAgent.lastName}
                onChange={(value) => setEditingAgent({ ...editingAgent, lastName: value })}
                required
              />
            </div>
            <Input
              label="Mobile Number"
              value={editingAgent.mobile}
              onChange={(value) => setEditingAgent({ ...editingAgent, mobile: value })}
              required
            />
            <Input
              label="New Password (optional)"
              type="password"
              placeholder="Leave empty to keep current password"
              value={editPassword}
              onChange={(value) => setEditPassword(value)}
            />
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>Mobile:</strong> {editingAgent.mobile} (can be changed)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Last Location:</strong> {editingAgent.lastLocation || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Password:</strong> Leave the password field empty to keep the current password, or enter a new password to update it.
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingAgent(null);
                  setEditPassword('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditAgent}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Agent Modal */}
      <Modal
        isOpen={!!viewingAgent}
        onClose={() => setViewingAgent(null)}
        title="Agent Details"
      >
        {viewingAgent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
                <p className="text-gray-900">{viewingAgent.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={viewingAgent.status}>
                  {viewingAgent.status.toUpperCase()}
                </StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <p className="text-gray-900">{viewingAgent.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <p className="text-gray-900">{viewingAgent.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <p className="text-gray-900">{viewingAgent.mobile}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <p className="text-gray-900">{viewingAgent.username || viewingAgent.mobile}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Location</label>
              <p className="text-gray-900">{viewingAgent.lastLocation || 'Unknown'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payments Today</label>
                <p className="text-gray-900">{viewingAgent.paymentsToday || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Payments</label>
                <p className="text-gray-900">{viewingAgent.totalPayments || 0}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setViewingAgent(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setViewingAgent(null);
                  setEditingAgent(viewingAgent);
                  setEditPassword(''); // Reset password field
                }}
                className="flex-1"
              >
                Edit Agent
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AgentManagement;
