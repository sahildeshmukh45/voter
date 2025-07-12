import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Modal, Input, Button } from '../ui';

import VidhansabhaDropdown from '../common/VidhansabhaDropdown';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  vidhansabhaNo?: string;
  vibhaghKramank?: string;
  paid?: boolean | null;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  isLoading = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    firstName: '',
    lastName: '',
    age: undefined,
    gender: '',
    vidhansabhaNo: '',
    vibhaghKramank: '',
    paid: null
  });

  const handleSearch = () => {
    // Remove empty string values
    const cleanFilters: SearchFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null) {
        cleanFilters[key as keyof SearchFilters] = value;
      }
    });
    
    onSearch(cleanFilters);
  };

  const handleClear = () => {
    setFilters({
      firstName: '',
      lastName: '',
      vidhansabhaNo: '',
      vibhaghKramank: '',
      paid: null
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Search"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={filters.firstName || ''}
            onChange={(value) => setFilters({ ...filters, firstName: value })}
            placeholder="Enter first name"
          />
          <Input
            label="Last Name"
            value={filters.lastName || ''}
            onChange={(value) => setFilters({ ...filters, lastName: value })}
            placeholder="Enter last name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Age"
            type="number"
            value={filters.age?.toString() || ''}
            onChange={(value) => setFilters({ ...filters, age: value ? parseInt(value) : undefined })}
            placeholder="Enter age"
            min="18"
            max="120"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={filters.gender || ''}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vidhansabha Constituency
            </label>
            <VidhansabhaDropdown
              value={filters.vidhansabhaNo || ''}
              onChange={(value) => setFilters({...filters, vidhansabhaNo: value})}
              placeholder="Select Vidhansabha Constituency"
            />
          </div>
          <Input
            label="Vibhagh Kramank"
            value={filters.vibhaghKramank || ''}
            onChange={(value) => setFilters({ ...filters, vibhaghKramank: value })}
            placeholder="Division/Section Number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paid === null || filters.paid === undefined ? '' : filters.paid.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ 
                ...filters, 
                paid: value === '' ? null : value === 'true' 
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClear}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdvancedSearchModal;
