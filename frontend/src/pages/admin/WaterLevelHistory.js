import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const WaterLevelHistory = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlert, setFilterAlert] = useState('all');
  const [threshold, setThreshold] = useState(90);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [waterLevelsRes, settingsRes] = await Promise.all([
        axios.get('/api/water-levels'),
        axios.get('/api/settings')
      ]);
      
      setWaterLevels(waterLevelsRes.data.data);
      setThreshold(settingsRes.data.data.criticalThreshold);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = waterLevels.filter(record => {
    const matchesSearch = 
      record.recordedBy?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.level.toString().includes(searchTerm);
    
    const matchesFilter = 
      filterAlert === 'all' ||
      (filterAlert === 'alerts' && record.isAlert) ||
      (filterAlert === 'safe' && !record.isAlert);

    return matchesSearch && matchesFilter;
  });

  const chartData = waterLevels
    .slice(0, 30)
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      level: record.level,
      threshold: threshold
    }));

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>💧 Water Level History</h2>

        {/* Chart */}
        <div style={{ marginBottom: '30px', background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px', color: '#4b5563' }}>Water Level Trend (Last 30 Records)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="3 3" label="Critical" />
              <Line type="monotone" dataKey="level" stroke="#667eea" strokeWidth={2} name="Water Level" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Search by level or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="form-control"
            value={filterAlert}
            onChange={(e) => setFilterAlert(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Records</option>
            <option value="alerts">Alerts Only</option>
            <option value="safe">Safe Levels</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Water Level (m)</th>
                <th>Status</th>
                <th>Recorded By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleString()}</td>
                    <td>
                      <strong style={{ color: record.isAlert ? '#ef4444' : '#10b981' }}>
                        {record.level}m
                      </strong>
                    </td>
                    <td>
                      {record.isAlert ? (
                        <span className="badge badge-danger">⚠️ Alert</span>
                      ) : (
                        <span className="badge badge-success">✓ Safe</span>
                      )}
                    </td>
                    <td>{record.recordedBy?.email || 'Unknown'}</td>
                    <td>{record.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            <strong>Total Records:</strong> {filteredData.length} | 
            <strong style={{ marginLeft: '16px' }}>Critical Threshold:</strong> {threshold}m
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelHistory;