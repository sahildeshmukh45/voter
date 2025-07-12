import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Table, Button, Card } from '../ui';
import type { TableColumn, Transaction } from '../../types';
import { Download, Trash2, AlertTriangle, Database, FileText } from 'lucide-react';

const DataManagement: React.FC = () => {
  const { transactions, exportData, clearAllData, loading } = useData();

  const columns: TableColumn<Transaction>[] = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true
    },
    {
      key: 'userId',
      label: 'User ID',
      sortable: true
    },
    {
      key: 'agentId',
      label: 'Agent ID',
      sortable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => `₹${amount}`,
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      ),
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleString() : '-',
      sortable: true
    }
  ];

  const handleDataWipe = () => {
    const confirmed = confirm(
      'WARNING: This will permanently delete ALL data including users, transactions, and history. This action cannot be undone!\n\nAre you sure you want to proceed?'
    );
    
    if (confirmed) {
      const doubleConfirm = confirm('This is your final warning. All data will be lost forever. Continue?');
      if (doubleConfirm) {
        clearAllData();
        alert('All data has been wiped!');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Management & Security</h1>
        <p className="text-gray-600">Manage system data, Excel exports, and security operations</p>
      </div>

      {/* Export Options */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Data Export (Excel Format)</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="primary"
              onClick={() => exportData('users')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <FileText className="w-8 h-8 mb-2" />
              <span>{loading ? 'Exporting...' : 'Export Users (.xlsx)'}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => exportData('agents')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <FileText className="w-8 h-8 mb-2" />
              <span>{loading ? 'Exporting...' : 'Export Agents (.xlsx)'}</span>
            </Button>

            <Button
              variant="info"
              onClick={() => exportData('transactions')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <FileText className="w-8 h-8 mb-2" />
              <span>{loading ? 'Exporting...' : 'Export Transactions (.xlsx)'}</span>
            </Button>

            <Button
              variant="success"
              onClick={() => exportData('all')}
              disabled={loading}
              className="flex flex-col items-center p-6 h-auto"
            >
              <Database className="w-8 h-8 mb-2" />
              <span>{loading ? 'Exporting...' : 'Export All Data (.xlsx)'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Transaction Log</h4>
          </div>
          <Button
            variant="secondary"
            onClick={() => exportData('transactions')}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exporting...' : 'Export Transactions (.xlsx)'}
          </Button>
        </div>
        
        <Table
          data={transactions}
          columns={columns}
          searchable
          searchPlaceholder="Search transactions..."
        />
      </div>

      {/* Danger Zone */}
      <Card className="border-danger-200 bg-danger-50">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
            <h4 className="text-lg font-semibold text-danger-900">Danger Zone</h4>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-danger-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-danger-900 mb-1">Emergency Data Wipe</h5>
                <p className="text-sm text-danger-700">
                  Permanently delete all system data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleDataWipe}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Wipe All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataManagement;
