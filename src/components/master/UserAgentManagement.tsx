import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Button, StatusBadge, Card } from '../ui';
import type { TableColumn, User, Agent } from '../../types';
import { Users, UserCheck, Download, Shield, UserPlus, UserCog, Search, Filter } from 'lucide-react';
import AdvancedSearchModal, { SearchFilters } from '../admin/AdvancedSearchModal';

type ViewMode = 'voters' | 'agents';

const UserAgentManagement: React.FC = () => {
  const { users: voters, agents, exportData } = useData();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('voters');
  const [selectedCreator, setSelectedCreator] = useState<string>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const voterColumns: TableColumn<User>[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'firstName', label: 'Name', render: (_, voter) => `${voter.firstName} ${voter.lastName}`, sortable: true },
    { key: 'age', label: 'Age', render: (age) => age || '-', sortable: true },
    { key: 'gender', label: 'Gender', render: (gender) => gender || '-', sortable: true },
    { key: 'vidhansabhaNo', label: 'Vidhansabha No', render: (vidhansabhaNo) => vidhansabhaNo || '-', sortable: true },
    { key: 'vibhaghKramank', label: 'Vibhagh Kramank', render: (vibhaghKramank) => vibhaghKramank || '-', sortable: true },
    { key: 'paid', label: 'Distribution Status', render: (paid) => <StatusBadge status={paid ? 'paid' : 'pending'}>{paid ? 'DISTRIBUTED' : 'PENDING'}</StatusBadge> },
    { key: 'amount', label: 'Amount Distributed', render: (amount) => `₹${amount?.toLocaleString() || 0}` },
    { key: 'paidDate', label: 'Distribution Date', render: (date) => date || '-' },
    { key: 'createdBy', label: 'Created By', render: (createdBy) => createdBy || 'System', sortable: true }
  ];

  const agentColumns: TableColumn<Agent>[] = [
    { key: 'id', label: 'Agent ID', sortable: true },
    { key: 'firstName', label: 'Name', render: (_, agent) => `${agent.firstName} ${agent.lastName}`, sortable: true },
    { key: 'mobile', label: 'Mobile', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status}>{status.toUpperCase()}</StatusBadge> },
    { key: 'lastLocation', label: 'Last Location' },
    { key: 'paymentsToday', label: 'Payments Today', sortable: true },
    { key: 'totalPayments', label: t.userManagement.totalPayments, sortable: true },
    { key: 'createdBy', label: 'Created By', render: (createdBy) => createdBy || 'Master', sortable: true }
  ];

  // Calculate creation statistics
  const getCreationStats = () => {
    if (viewMode === 'voters') {
      const votersByCreator = voters.reduce((acc, voter) => {
        const creator = voter.createdBy || 'System';
        acc[creator] = (acc[creator] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return votersByCreator;
    } else {
      const agentsByCreator = agents.reduce((acc, agent) => {
        const creator = agent.createdBy || 'Master';
        acc[creator] = (acc[creator] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return agentsByCreator;
    }
  };

  const creationStats = getCreationStats();

  // Filter data based on selected creator and search results
  const filteredData = () => {
    // If we have search results, use them for voters
    if (hasSearched && viewMode === 'voters') {
      if (selectedCreator === 'all') {
        return searchResults;
      }
      return searchResults.filter(voter => (voter.createdBy || 'System') === selectedCreator);
    }

    // Otherwise use normal filtering
    if (selectedCreator === 'all') {
      return viewMode === 'voters' ? voters : agents;
    }

    if (viewMode === 'voters') {
      return voters.filter(voter => (voter.createdBy || 'System') === selectedCreator);
    } else {
      return agents.filter(agent => (agent.createdBy || 'Master') === selectedCreator);
    }
  };

  // Get unique creators for filter dropdown
  const getCreatorOptions = () => {
    const creators = Object.keys(creationStats);
    return [{ value: 'all', label: 'All Creators' }, ...creators.map(creator => ({ value: creator, label: creator }))];
  };

  // Reset filter when view mode changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedCreator('all');
    setHasSearched(false);
    setSearchResults([]);
  };

  // Handle advanced search
  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`http://localhost:8080/api/users/search/advanced?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.success ? data.data.content || [] : [];
        setSearchResults(results);
        setHasSearched(true);
        setShowAdvancedSearch(false);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Voters & Agents Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Comprehensive view of all voters and field agents</p>
      </div>

      {/* View Toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'voters' ? 'primary' : 'secondary'}
              onClick={() => handleViewModeChange('voters')}
            >
              <Users className="w-4 h-4 mr-2" />
              Voters ({voters.length})
            </Button>
            <Button
              variant={viewMode === 'agents' ? 'primary' : 'secondary'}
              onClick={() => handleViewModeChange('agents')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Agents ({agents.length})
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {viewMode === 'voters' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowAdvancedSearch(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Advanced Search
                </Button>
                {hasSearched && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Search
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => exportData(viewMode === 'voters' ? 'users' : 'agents')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export {viewMode === 'voters' ? 'Voters' : 'Agents'} (.xlsx)
            </Button>
            <Button
              variant="info"
              onClick={() => exportData('all')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Export All Data (.xlsx)
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {viewMode === 'voters' ? (
          <>
            <Card className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{voters.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Voters</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{voters.filter(v => v.paid).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Money Distributed</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{voters.filter(v => !v.paid).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Distribution</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{voters.filter(v => v.paid).reduce((sum, v) => sum + (v.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Distributed</div>
            </Card>
          </>
        ) : (
          <>
            <Card className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{agents.filter(a => a.status === 'active').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{agents.filter(a => a.status === 'blocked').length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Blocked Agents</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {agents.reduce((sum, a) => sum + a.totalPayments, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t.userManagement.totalPayments}</div>
            </Card>
          </>
        )}
      </div>

      {/* Creation Statistics */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          {viewMode === 'voters' ? (
            <UserPlus className="w-5 h-5 text-blue-600" />
          ) : (
            <UserCog className="w-5 h-5 text-purple-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {viewMode === 'voters' ? 'Voters Created By Agent' : 'Agents Created By Sub-Admin'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(creationStats).map(([creator, count]) => (
            <div key={creator} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {viewMode === 'voters' ? 'Agent' : 'Sub-Admin'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={creator}>
                    {creator}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {viewMode === 'voters' ? 'users' : 'agents'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(creationStats).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-lg font-medium">No {viewMode} found</div>
            <div className="text-sm">
              {viewMode === 'voters'
                ? 'No users have been created by agents yet'
                : 'No agents have been created by sub-admins yet'
              }
            </div>
          </div>
        )}
      </Card>

      {/* Data Table */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {viewMode === 'voters' ?
                (hasSearched ? `Voter Search Results (${searchResults.length} found)` : 'Voter Database') :
                'Agent Database'
              }
            </h3>

            {/* Creator Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Creator:</label>
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {getCreatorOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === 'voters' ? (
            <Table
              data={filteredData() as User[]}
              columns={voterColumns}
              searchable={!hasSearched}
              searchPlaceholder="Search voters..."
            />
          ) : (
            <Table
              data={filteredData() as Agent[]}
              columns={agentColumns}
              searchable
              searchPlaceholder="Search agents..."
            />
          )}
        </div>
      </Card>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
};

export default UserAgentManagement;
