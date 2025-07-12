import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { Table, Button, StatusBadge, Modal, Input, Card } from '../ui';
import { filesApi, usersApi } from '../../services/api';
import type { TableColumn, User } from '../../types';
import { Upload, Download, Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import AdvancedSearchModal, { SearchFilters } from './AdvancedSearchModal';
import VidhansabhaDropdown from '../common/VidhansabhaDropdown';

const UserManagement: React.FC = () => {
  const { users: voters, updateUser: updateVoter, addUser: addVoter, deleteUser: deleteVoter, exportData } = useData();
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState<User | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Check if current user is master admin
  const isMasterAdmin = user?.role === 'master';
  const [newVoter, setNewVoter] = useState({
    firstName: '',
    lastName: '',
    age: 18,
    gender: 'MALE',
    vidhansabhaNo: '',
    vibhaghKramank: '',
    amount: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const columns: TableColumn<User>[] = [
    {
      key: 'firstName',
      label: 'Name',
      render: (_, voter) => `${voter.firstName} ${voter.lastName}`,
      sortable: true
    },
    {
      key: 'age',
      label: 'Age',
      render: (age) => age || '-',
      sortable: true
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (gender) => gender || '-',
      sortable: true
    },
    {
      key: 'vidhansabhaNo',
      label: 'Vidhansabha No',
      render: (vidhansabhaNo) => vidhansabhaNo || '-',
      sortable: true
    },
    {
      key: 'vibhaghKramank',
      label: 'Vibhagh Kramank',
      render: (vibhaghKramank) => vibhaghKramank || '-',
      sortable: true
    },
    {
      key: 'paid',
      label: 'Distribution Status',
      render: (paid) => (
        <StatusBadge status={paid ? 'paid' : 'pending'}>
          {paid ? 'DISTRIBUTED' : 'PENDING'}
        </StatusBadge>
      )
    },
    {
      key: 'amount',
      label: 'Amount Distributed',
      render: (amount) => `₹${amount.toLocaleString()}`
    },
    {
      key: 'paidDate',
      label: 'Distribution Date',
      render: (date) => date || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditingVoter(user)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteVoter(user.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleAddVoter = () => {
    if (newVoter.firstName && newVoter.lastName && newVoter.age >= 18) {
      addVoter({
        ...newVoter,
        paid: false,
        paidDate: null,
        paidBy: null
      });
      setNewVoter({
        firstName: '',
        lastName: '',
        age: 18,
        gender: 'MALE',
        vidhansabhaNo: '',
        vibhaghKramank: '',
        amount: 0
      });
      setShowAddModal(false);
    }
  };

  const handleEditVoter = () => {
    if (editingVoter) {
      updateVoter(editingVoter.id, editingVoter);
      setEditingVoter(null);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      setIsSearching(true);

      // Call the advanced search API using the service
      const response = await usersApi.advancedSearch({
        ...filters,
        page: 0,
        size: 100
      });

      if (response.success) {
        const voters = response.data.content || [];
        setSearchResults(voters);
        setHasSearched(true);
        setShowAdvancedSearch(false);
        showSuccess(`Found ${voters.length} voters`);
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to search voters');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  const downloadTemplate = async () => {
    try {
      // Call backend API to get Excel template
      const response = await fetch('http://localhost:8080/api/files/template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'voter_data_template.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess('Excel template downloaded successfully');
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      showError('Failed to download template');
    }
  };

  const handleDeleteVoter = (voterId: number) => {
    if (confirm('Are you sure you want to delete this voter?')) {
      deleteVoter(voterId);
    }
  };

  const generateSampleData = async () => {
    try {
      setIsUploading(true);
      const sampleVoters = [
        { firstName: "James", lastName: "Anderson", age: 35, gender: "MALE", vidhansabhaNo: "288", vibhaghKramank: "01" },
        { firstName: "Lisa", lastName: "Taylor", age: 28, gender: "FEMALE", vidhansabhaNo: "289", vibhaghKramank: "02" },
        { firstName: "Robert", lastName: "Martinez", age: 42, gender: "MALE", vidhansabhaNo: "290", vibhaghKramank: "03" }
      ];

      // Call backend API to create voters
      for (const voter of sampleVoters) {
        try {
          const response = await fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
            },
            body: JSON.stringify(voter)
          });

          if (!response.ok) {
            throw new Error(`Failed to create voter: ${voter.firstName} ${voter.lastName}`);
          }
        } catch (error) {
          console.error('Error creating voter:', error);
          // Continue with next voter even if one fails
        }
      }

      showSuccess('Sample data generated successfully!', 'New users have been added to the system.');
    } catch (error) {
      console.error('Error generating sample data:', error);
      showError('Failed to generate sample data', 'Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // First validate the file
      const validationResponse = await filesApi.validateFile(file);

      if (!validationResponse.success || !validationResponse.data.isValid) {
        const warnings = validationResponse.data.warnings || ['File validation failed'];
        showError('File validation failed', warnings.join('\n'));
        setIsUploading(false);
        return;
      }

      // If validation passes, upload the file
      const uploadResponse = await filesApi.uploadUsers(file);

      if (uploadResponse.success) {
        const result = uploadResponse.data;
        const message = `File uploaded successfully!

Total Records: ${result.totalRecords}
Successful: ${result.successfulRecords}
Failed: ${result.failedRecords}

${result.errors && result.errors.length > 0 ?
  'Errors:\n' + result.errors.slice(0, 5).join('\n') +
  (result.errors.length > 5 ? '\n... and more' : '') : ''}`;

        showSuccess('File uploaded successfully!', message);
      } else {
        showError('Upload failed', uploadResponse.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Error uploading file', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Voter Management</h1>
        <p className="text-gray-600">Manage voter database and money distribution records</p>
      </div>

      {/* Upload Section */}
      <Card>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Upload Voter Data</h4>
          </div>
          <p className="text-gray-600">Drag and drop CSV/Excel file or click to browse</p>
          <p className="text-sm text-gray-500">
            Import voter data with: firstName, lastName, age, gender, vidhansabhaNo, vibhaghKramank
          </p>
          <p className="text-sm text-gray-500">
            Note: Amount starts at ₹0 and will be updated when agents distribute money to voters
          </p>
          <div className="flex justify-center space-x-3">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={isUploading}
            />
            <Button
              variant="primary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            {isMasterAdmin && (
              <Button
                variant="secondary"
                onClick={generateSampleData}
                disabled={isUploading}
              >
                <Users className="w-4 h-4 mr-2" />
                {isUploading ? 'Creating...' : 'Generate Sample Data'}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              disabled={isUploading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </Card>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {hasSearched ? `Search Results (${searchResults.length} found)` : `Voter Database (${voters.length} total)`}
          </h4>
          {hasSearched && (
            <Button variant="secondary" size="sm" onClick={handleClearSearch}>
              Clear Search
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowAdvancedSearch(true)}>
            <Search className="w-4 h-4 mr-2" />
            Advanced Search
          </Button>
          <Button variant="secondary" onClick={() => exportData('voters')}>
            <Download className="w-4 h-4 mr-2" />
            Export Data (.xlsx)
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Voter
          </Button>
        </div>
      </div>

      {/* Voters Table */}
      <Table
        data={hasSearched ? searchResults : voters}
        columns={columns}
        searchable={!hasSearched}
        searchPlaceholder="Search voters..."
      />

      {/* Add Voter Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Voter"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newVoter.firstName}
              onChange={(value) => setNewVoter({ ...newVoter, firstName: value })}
              required
            />
            <Input
              label="Last Name"
              value={newVoter.lastName}
              onChange={(value) => setNewVoter({ ...newVoter, lastName: value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={newVoter.age?.toString() || '18'}
              onChange={(value) => setNewVoter({ ...newVoter, age: parseInt(value) || 18 })}
              required
              min="18"
              max="120"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={newVoter.gender}
                onChange={(e) => setNewVoter({ ...newVoter, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vidhansabha Constituency</label>
            <VidhansabhaDropdown
              value={newVoter.vidhansabhaNo}
              onChange={(value) => setNewVoter({...newVoter, vidhansabhaNo: value})}
              placeholder="Select Vidhansabha Constituency"
            />
          </div>
          <Input
            label="Vibhagh Kramank"
            value={newVoter.vibhaghKramank}
            onChange={(value) => setNewVoter({ ...newVoter, vibhaghKramank: value })}
            placeholder="Division/Section Number"
          />
          <div className="text-sm text-gray-500">
            <p>Note: Amount will start at ₹0 and will be updated when agents distribute money to this voter.</p>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddVoter}
              className="flex-1"
            >
              Add Voter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Voter Modal */}
      <Modal
        isOpen={!!editingVoter}
        onClose={() => setEditingVoter(null)}
        title="Edit Voter"
      >
        {editingVoter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={editingVoter.firstName}
                onChange={(value) => setEditingVoter({ ...editingVoter, firstName: value })}
                required
              />
              <Input
                label="Last Name"
                value={editingVoter.lastName}
                onChange={(value) => setEditingVoter({ ...editingVoter, lastName: value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                value={editingVoter.age?.toString() || '18'}
                onChange={(value) => setEditingVoter({ ...editingVoter, age: parseInt(value) || 18 })}
                required
                min="18"
                max="120"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={editingVoter.gender || 'MALE'}
                  onChange={(e) => setEditingVoter({ ...editingVoter, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vidhansabha Constituency</label>
              <VidhansabhaDropdown
                value={editingVoter.vidhansabhaNo || ''}
                onChange={(value) => setEditingVoter({...editingVoter, vidhansabhaNo: value})}
                placeholder="Select Vidhansabha Constituency"
              />
            </div>
            <Input
              label="Vibhagh Kramank"
              value={editingVoter.vibhaghKramank || ''}
              onChange={(value) => setEditingVoter({ ...editingVoter, vibhaghKramank: value })}
              placeholder="Division/Section Number"
            />
            <Input
              label="Amount Distributed (₹)"
              type="number"
              value={editingVoter.amount?.toString() || '0'}
              onChange={(value) => setEditingVoter({ ...editingVoter, amount: parseInt(value) || 0 })}
              required
            />
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setEditingVoter(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEditVoter}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        isLoading={isSearching}
      />
    </div>
  );
};

export default UserManagement;
