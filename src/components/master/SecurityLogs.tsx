import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Table, Card, StatusBadge } from '../ui';
import type { TableColumn, LoginLog } from '../../types';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const SecurityLogs: React.FC = () => {
  const { loginLogs } = useData();

  const columns: TableColumn<LoginLog>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true
    },
    {
      key: 'user',
      label: 'Username',
      sortable: true
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => (
        <StatusBadge status={role === 'master' ? 'warning' : role === 'admin' ? 'info' : 'active'}>
          {role.toUpperCase()}
        </StatusBadge>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <StatusBadge status={status === 'Success' ? 'success' : 'danger'}>
          {status === 'Success' ? (
            <><CheckCircle className="w-3 h-3" /> SUCCESS</>
          ) : (
            <><XCircle className="w-3 h-3" /> FAILED</>
          )}
        </StatusBadge>
      )
    }
  ];

  const successfulLogins = loginLogs.filter(log => log.status === 'Success').length;
  const failedLogins = loginLogs.filter(log => log.status === 'Failed').length;
  const successRate = loginLogs.length > 0 ? (successfulLogins / loginLogs.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Security & Audit Logs</h1>
        <p className="text-gray-600">Monitor system access and security events</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{successfulLogins}</div>
          <div className="text-sm text-green-600">Successful Logins</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{failedLogins}</div>
          <div className="text-sm text-red-600">Failed Attempts</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{Math.round(successRate)}%</div>
          <div className="text-sm text-blue-600">Success Rate</div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-900">0</div>
          <div className="text-sm text-yellow-600">Security Alerts</div>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Firewall Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SSL Certificate</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Valid
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Two-Factor Auth</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  ⚠ Optional
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data Encryption</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ AES-256
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Backup Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Current
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Intrusion Detection</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✓ Monitoring
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Login Logs */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Login Activity Log</h3>
          
          <Table
            data={loginLogs.slice(-100).reverse()}
            columns={columns}
            searchable
            searchPlaceholder="Search login logs..."
          />
        </div>
      </Card>
    </div>
  );
};

export default SecurityLogs;
