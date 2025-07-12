import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../common/Toast';
import { Table, Button, StatusBadge, Modal, Input, Card } from '../ui';
import { adminsApi } from '../../services/api';
import type { TableColumn, Administrator } from '../../types';
import { Plus, Edit, Trash2, Shield, ShieldOff, Crown, Eye } from 'lucide-react';

const AdminManagement: React.FC = () => {
  const { administrators, deleteAdmin, blockAdmin, unblockAdmin } = useData();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { showSuccess, showError } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Administrator | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<Administrator | null>(null);

  const columns: TableColumn<Administrator>[] = [
    {
      key: 'id',
      label: 'Admin ID',
      sortable: true
    },
    {
      key: 'firstName',
      label: 'Name',
      render: (_, admin) => `${admin.firstName} ${admin.lastName}`,
      sortable: true
    },
    {
      key: 'mobile',
      label: 'Mobile Number',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => (
        <StatusBadge status={role === 'ADMIN' ? 'info' : 'warning'}>
          {role === 'ADMIN' ? 'SUB-ADMIN' : 'SUPERVISOR'}
        </StatusBadge>
      )
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
      key: 'createdAt',
      label: 'Created Date',
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleDateString() : '-',
      sortable: true
    },
    {
      key: 'totalPayments',
      label: 'Total Payments Overseen',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, admin) => (
        <div className="flex space-x-1 min-w-[200px]">
          {/* Read/View Button */}
            <Button
              variant="info"
              size="sm"
              onClick={() => setViewingAdmin(admin)}
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>

            {/* Update/Edit Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingAdmin(admin);
                setEditPassword(''); // Reset password field
              }}
              title="Edit Admin"
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteAdmin(admin.id)}
              title="Delete Admin"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

          {/* Block/Unblock Button */}
          {admin.status === 'ACTIVE' ? (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleBlockAdmin(admin.id)}
              title="Block Admin"
            >
              <ShieldOff className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUnblockAdmin(admin.id)}
              title="Unblock Admin"
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleAddAdmin = async () => {
    if (newAdmin.firstName && newAdmin.lastName && newAdmin.mobile && newAdmin.password) {
      setLoading(true);
      try {
        console.log('Creating sub-admin with data:', newAdmin);
        const response = await adminsApi.create({
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          mobile: newAdmin.mobile,
          password: newAdmin.password
        });

        console.log('Sub-admin created successfully:', response);
        showSuccess('Sub-admin created successfully!', `Mobile: ${newAdmin.mobile}\nPassword: ${newAdmin.password}\n\nPlease provide these credentials to the sub-admin manually.`);

        // Reset form
        setNewAdmin({
          firstName: '',
          lastName: '',
          mobile: '',
          password: ''
        });

        setShowAddModal(false);

        // The DataContext will automatically update the administrators list

      } catch (error) {
        console.error('Error creating sub-admin:', error);
        showError('Failed to create sub-admin', 'Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleEditAdmin = async () => {
    if (editingAdmin) {
      setLoading(true);
      try {
        const updateData: any = {
          firstName: editingAdmin.firstName,
          lastName: editingAdmin.lastName,
          mobile: editingAdmin.mobile
        };

        // Only include password if it's provided
        if (editPassword && editPassword.trim() !== '') {
          updateData.password = editPassword;
        }

        const response = await adminsApi.update(editingAdmin.id, updateData);

        console.log('Sub-admin updated successfully:', response);

        if (editPassword && editPassword.trim() !== '') {
          showSuccess('Sub-admin updated successfully!', `New password: ${editPassword}\n\nPlease provide the new password to the sub-admin manually.`);
        } else {
          showSuccess('Sub-admin updated successfully!');
        }

        setEditingAdmin(null);
        setEditPassword('');

      } catch (error) {
        console.error('Error updating sub-admin:', error);
        showError('Failed to update sub-admin', 'Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('Are you sure you want to delete this administrator? This action cannot be undone.')) {
      try {
        console.log('Deleting admin:', adminId);
        await deleteAdmin(adminId);
        showSuccess('Administrator deleted successfully!');
      } catch (error) {
        console.error('Error deleting admin:', error);
        showError('Failed to delete administrator', 'Please try again.');
      }
    }
  };

  const handleBlockAdmin = async (adminId: string) => {
    try {
      await blockAdmin(adminId);
      showSuccess('Administrator blocked successfully!');
    } catch (error) {
      console.error('Error blocking admin:', error);
      showError('Failed to block administrator', 'Please try again.');
    }
  };

  const handleUnblockAdmin = async (adminId: string) => {
    try {
      await unblockAdmin(adminId);
      showSuccess('Administrator unblocked successfully!');
    } catch (error) {
      console.error('Error unblocking admin:', error);
      showError('Failed to unblock administrator', 'Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Administrator Management</h1>
        <p className="text-gray-600">Manage system administrators and their permissions</p>
      </div>

      {/* Admin Creation Form */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Create New Administrator</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="First Name"
              value={newAdmin.firstName}
              onChange={(value) => setNewAdmin({ ...newAdmin, firstName: value })}
            />
            <Input
              placeholder="Last Name"
              value={newAdmin.lastName}
              onChange={(value) => setNewAdmin({ ...newAdmin, lastName: value })}
            />
            <Input
              placeholder="Mobile Number"
              type="tel"
              value={newAdmin.mobile}
              onChange={(value) => setNewAdmin({ ...newAdmin, mobile: value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              placeholder="Password"
              type="password"
              value={newAdmin.password}
              onChange={(value) => setNewAdmin({ ...newAdmin, password: value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> The mobile number and password you enter will be displayed after creation. Please provide these credentials to the sub-admin manually.
            </p>
          </div>

          <Button
            variant="success"
            onClick={handleAddAdmin}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Sub-Administrator'}
          </Button>
        </div>
      </Card>

      {/* Administrators Table */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          Current Administrators ({administrators.length} total)
        </h4>
        
        <Table
          data={administrators}
          columns={columns}
          searchable
          searchPlaceholder="Search administrators..."
        />
      </div>

      {/* Edit Admin Modal */}
      <Modal
        isOpen={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        title="Edit Administrator"
      >
        {editingAdmin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={editingAdmin.firstName}
                onChange={(value) => setEditingAdmin({ ...editingAdmin, firstName: value })}
                required
              />
              <Input
                label="Last Name"
                value={editingAdmin.lastName}
                onChange={(value) => setEditingAdmin({ ...editingAdmin, lastName: value })}
                required
              />
            </div>
            <Input
              label="Mobile Number"
              type="tel"
              value={editingAdmin.mobile}
              onChange={(value) => setEditingAdmin({ ...editingAdmin, mobile: value })}
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
                <strong>Mobile:</strong> {editingAdmin.mobile} (can be changed)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Role:</strong> Sub-Administrator (cannot be changed)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Password:</strong> Leave the password field empty to keep the current password, or enter a new password to update it.
              </p>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingAdmin(null);
                  setEditPassword('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditAdmin}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Admin Modal */}
      <Modal
        isOpen={!!viewingAdmin}
        onClose={() => setViewingAdmin(null)}
        title="Sub-Admin Details"
      >
        {viewingAdmin && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                <p className="text-gray-900">{viewingAdmin.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={viewingAdmin.status}>
                  {viewingAdmin.status.toUpperCase()}
                </StatusBadge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <p className="text-gray-900">{viewingAdmin.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <p className="text-gray-900">{viewingAdmin.lastName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <p className="text-gray-900">{viewingAdmin.mobile}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900 flex items-center">
                  <Crown className="w-4 h-4 mr-1 text-yellow-500" />
                  {viewingAdmin.role.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Payments</label>
                <p className="text-gray-900">{viewingAdmin.totalPayments || 0}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
              <p className="text-gray-900">{viewingAdmin.createdDate || 'Unknown'}</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setViewingAdmin(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setViewingAdmin(null);
                  setEditingAdmin(viewingAdmin);
                  setEditPassword(''); // Reset password field
                }}
                className="flex-1"
              >
                Edit Admin
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminManagement;
