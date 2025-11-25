import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = ({ onUpdate }) => {
  const [threshold, setThreshold] = useState(90);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings');
      setThreshold(response.data.data.criticalThreshold);
    } catch (error) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (threshold < 0) {
      setError('Threshold cannot be negative');
      return;
    }

    if (!threshold) {
      setError('Threshold is required');
      return;
    }

    try {
      setSaving(true);
      await axios.put('/api/settings/threshold', { criticalThreshold: threshold });
      setSuccess('Critical threshold updated successfully');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update threshold');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>⚙️ System Settings</h2>

        {success && (
          <div className="alert alert-success">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="threshold">
              Critical Water Level Threshold (meters)
            </label>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              Water levels above this threshold will trigger alerts. Default is 90 meters (Safe Level).
            </p>
            <input
              type="number"
              id="threshold"
              className="form-control"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min="0"
              step="0.1"
              disabled={saving}
              style={{ maxWidth: '300px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        <div style={{ marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>ℹ️ Information</h3>
          <ul style={{ paddingLeft: '20px', color: '#4b5563', lineHeight: '1.8' }}>
            <li>The critical threshold determines when water level alerts are triggered</li>
            <li>When operators record water levels above this threshold, an alert will be generated</li>
            <li>Existing records will be automatically re-evaluated when the threshold changes</li>
            <li>Alerts are displayed on the admin dashboard for immediate attention</li>
            <li>Default safe level is set to 90 meters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;