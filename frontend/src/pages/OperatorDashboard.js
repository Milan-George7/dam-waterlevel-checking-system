import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './OperatorDashboard.css';

const OperatorDashboard = () => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    level: '',
    date: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        level: record.level,
        date: new Date(record.date).toISOString().slice(0, 16),
        notes: record.notes || ''
      });
    } else {
      setEditingRecord(null);
      setFormData({
        level: '',
        date: new Date().toISOString().slice(0, 16),
        notes: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setFormData({ level: '', date: new Date().toISOString().slice(0, 16), notes: '' });
    setError('');
  };

  const validateForm = () => {
    if (!formData.level) {
      setError('Water level is required');
      return false;
    }

    if (formData.level < 0) {
      setError('Water level cannot be negative');
      return false;
    }

    if (!formData.date) {
      setError('Date is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      if (editingRecord) {
        await axios.put(`/api/water-levels/${editingRecord._id}`, formData);
        setSuccess('Water level updated successfully');
      } else {
        await axios.post('/api/water-levels', formData);
        setSuccess('Water level recorded successfully');
        
        // Check if alert
        if (parseFloat(formData.level) > threshold) {
          setSuccess('Water level recorded successfully. ⚠️ Alert: Level exceeds threshold!');
        }
      }

      fetchData();
      handleCloseModal();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await axios.delete(`/api/water-levels/${id}`);
      setSuccess('Record deleted successfully');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredData = waterLevels.filter(record =>
    record.level.toString().includes(searchTerm) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalRecords: waterLevels.length,
    averageLevel: waterLevels.length > 0 
      ? (waterLevels.reduce((sum, r) => sum + r.level, 0) / waterLevels.length).toFixed(2)
      : 0,
    alertCount: waterLevels.filter(r => r.isAlert).length,
    latestLevel: waterLevels.length > 0 ? waterLevels[0].level : 0
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard">
      <Navbar title="Operator Dashboard" />
      
      <div className="container">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              💧
            </div>
            <div className="stat-content">
              <h3>Latest Level</h3>
              <p>{stats.latestLevel}m</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ddd6fe' }}>
              📊
            </div>
            <div className="stat-content">
              <h3>Average Level</h3>
              <p>{stats.averageLevel}m</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              📝
            </div>
            <div className="stat-content">
              <h3>Total Records</h3>
              <p>{stats.totalRecords}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>
              ⚠️
            </div>
            <div className="stat-content">
              <h3>Alerts</h3>
              <p>{stats.alertCount}</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ color: '#1f2937' }}>💧 Water Level Records</h2>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              + Add Record
            </button>
          </div>

          {success && (
            <div className="alert alert-success">
              ✓ {success}
            </div>
          )}

          {error && !showModal && (
            <div className="alert alert-danger">
              ⚠️ {error}
            </div>
          )}

          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            ℹ️ Critical Threshold: <strong>{threshold}m</strong> - Levels above this will trigger alerts
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by level or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Water Level (m)</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      No records found. Click "Add Record" to create your first entry.
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
                      <td>{record.notes || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleOpenModal(record)}
                          className="btn btn-warning"
                          style={{ marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecord ? 'Edit Water Level' : 'Add Water Level'}</h2>
              <button onClick={handleCloseModal} className="modal-close">
                ×
              </button>
            </div>

            {error && (
              <div className="alert alert-danger">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Water Level (meters) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Enter water level"
                  step="0.01"
                  min="0"
                />
                {formData.level && parseFloat(formData.level) > threshold && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠️ Warning: This level exceeds the critical threshold of {threshold}m
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Date & Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows="3"
                  maxLength="500"
                  style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {formData.notes.length}/500 characters
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecord ? 'Update' : 'Add'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;