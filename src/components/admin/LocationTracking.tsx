import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Table, Card, Button } from '../ui';
import GoogleMap from '../ui/GoogleMap';
import { LocationWebSocket } from '../../services/api';
import type { TableColumn, LocationHistory } from '../../types';
import { MapPin, Clock, RefreshCw, Users, Activity, Wifi, WifiOff, Map } from 'lucide-react';

// Location API for REST calls
const locationApi = {
  getAllAgentLocations: async () => {
    try {
      const response = await fetch('http://localhost:8383/api/location/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });
      const data = await response.json();
      return { success: response.ok, data: data.data || [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  }
};

const LocationTracking: React.FC = () => {
  const { locationHistory, agents } = useData();
  const [liveLocations, setLiveLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);


  const [showMap, setShowMap] = useState(true);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [mapsConfigLoaded, setMapsConfigLoaded] = useState(false);

  const columns: TableColumn<LocationHistory>[] = [
    {
      key: 'agentId',
      label: 'Agent ID',
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'latitude',
      label: 'Latitude',
      render: (lat) => lat?.toFixed(6) || 'N/A',
      sortable: true
    },
    {
      key: 'longitude',
      label: 'Longitude',
      render: (lng) => lng?.toFixed(6) || 'N/A',
      sortable: true
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : '-',
      sortable: true
    },
    {
      key: 'action',
      label: 'Action',
      render: (action) => action || 'Location Update',
      sortable: true
    }
  ];

  const fetchLiveLocations = async () => {
    try {
      setLoading(true);
      const response = await locationApi.getAllAgentLocations();
      if (response.success) {
        setLiveLocations(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching live locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleMapsConfig = async () => {
    try {
      const response = await fetch('http://localhost:8383/api/config/google-maps-key', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('voter_admin_token')}`
        }
      });
      const data = await response.json();

      if (data.success && data.data?.apiKey) {
        setGoogleMapsApiKey(data.data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching Google Maps config:', error);
    } finally {
      setMapsConfigLoaded(true);
    }
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new LocationWebSocket();

    // Connect WebSocket with event handlers
    ws.connect(
      // On location update
      (locationUpdate) => {
        console.log('Real-time location update:', locationUpdate);
        setLiveLocations(prev => {
          const updated = [...prev];
          const index = updated.findIndex(loc => loc.agentId === locationUpdate.agentId);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...locationUpdate, lastSeen: new Date().toISOString() };
          } else {
            updated.push({ ...locationUpdate, lastSeen: new Date().toISOString(), isOnline: true });
          }
          return updated;
        });
      },
      // On agent online
      (agentData) => {
        console.log('Agent came online:', agentData);
        setLiveLocations(prev => {
          const updated = [...prev];
          const index = updated.findIndex(loc => loc.agentId === agentData.agentId);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...agentData, isOnline: true };
          } else {
            updated.push({ ...agentData, isOnline: true });
          }
          return updated;
        });
      },
      // On agent offline
      (agentData) => {
        console.log('Agent went offline:', agentData);
        setLiveLocations(prev =>
          prev.map(loc =>
            loc.agentId === agentData.agentId
              ? { ...loc, isOnline: false }
              : loc
          )
        );
      }
    );

    setWsConnected(true);

    // Initial fetch
    fetchLiveLocations();
    fetchGoogleMapsConfig();

    // Cleanup on unmount
    return () => {
      ws.disconnect();
      setWsConnected(false);
    };
  }, []);

  // Fallback polling for when WebSocket is not connected
  useEffect(() => {
    if (!wsConnected) {
      const interval = setInterval(fetchLiveLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [wsConnected]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Tracking</h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">Monitor agent locations and movement history</p>
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Real-time Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Polling Mode</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showMap ? "primary" : "secondary"}
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="w-4 h-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <Button onClick={fetchLiveLocations} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Agent Locations */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Live Agent Locations</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">
                    {liveLocations.filter(loc => loc.isOnline).length} Agents Tracked
                  </div>
                  <div className="text-sm text-blue-700">Currently online and tracking</div>
                  <div className="text-xs text-blue-600">
                    Total agents: {agents.filter(agent => agent.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>

            {liveLocations.filter(loc => loc.isOnline).length === 0 ? (
              <div className="col-span-full bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-700 mb-2">No Agents Currently Tracking</h4>
                <p className="text-sm text-gray-600">
                  Agents will appear here when they start location tracking from their mobile app
                </p>
              </div>
            ) : (
              liveLocations.filter(loc => loc.isOnline).map(location => (
                <div key={location.agentId} className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">
                        {location.agentName || `Agent ${location.agentId}`}
                      </div>
                      <div className="text-sm text-green-700">{location.location || 'Location updating...'}</div>
                      <div className="text-xs text-green-600">
                        Last seen: {location.lastSeen ? new Date(location.lastSeen).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Google Maps */}
      {showMap && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Map className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900">Real-time Agent Locations</h4>
              </div>
              <span className="text-sm text-gray-500">
                {liveLocations.filter(loc => loc.latitude && loc.longitude).length} locations on map
              </span>
            </div>

            {!mapsConfigLoaded ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Maps Configuration...</p>
              </div>
            ) : !googleMapsApiKey ? (
              <div className="text-center py-16 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
                <MapPin className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Google Maps API Key Required</h3>
                <p className="text-yellow-700 mb-4">
                  Please add your Google Maps API key to display the interactive map
                </p>
                <div className="bg-yellow-100 p-4 rounded-lg text-left max-w-2xl mx-auto">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Steps to add API key:</strong>
                  </p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Get your API key from Google Cloud Console</li>
                    <li>Enable Maps JavaScript API</li>
                    <li>Replace 'YOUR_GOOGLE_MAPS_API_KEY_HERE' in LocationTracking.tsx</li>
                    <li>Or add it to backend application.properties</li>
                  </ol>
                </div>
              </div>
            ) : (
              <GoogleMap
                locations={liveLocations
                  .filter(loc => loc.latitude && loc.longitude)
                  .map(loc => ({
                    id: loc.agentId,
                    agentId: loc.agentId,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    location: loc.location || 'Unknown Location',
                    isOnline: loc.isOnline || false,
                    lastSeen: loc.lastSeen
                  }))}
                apiKey={googleMapsApiKey}
                height="500px"
              />
            )}
          </div>
        </Card>
      )}

      {/* Location History */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h4 className="text-lg font-semibold text-gray-900">Location History</h4>
        </div>
        
        {locationHistory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Location History Available</h3>
            <p className="text-gray-600 mb-4">
              Location history will appear here when agents start using the mobile app and tracking their locations.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
              <p className="text-sm text-blue-800 mb-2">
                <strong>How location tracking works:</strong>
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Agents use the mobile app to start location tracking</li>
                <li>Location updates are sent every 5 seconds automatically</li>
                <li>All location history is stored and displayed here</li>
                <li>Real-time updates appear on the map above</li>
              </ul>
            </div>
          </div>
        ) : (
          <Table
            data={locationHistory.slice(-50).reverse()}
            columns={columns}
            searchable
            searchPlaceholder="Search location history..."
          />
        )}
      </div>
    </div>
  );
};

export default LocationTracking;
