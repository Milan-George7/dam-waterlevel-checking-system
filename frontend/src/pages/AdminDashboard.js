import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import OperatorManagement from './admin/OperatorManagement';
import WaterLevelHistory from './admin/WaterLevelHistory';
import Settings from './admin/Settings';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOperators: 0,
    totalRecords: 0,
    activeAlerts: 0,
    criticalThreshold: 90
  });
  const [alerts, setAlerts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchStats();
    fetchAlerts();
    
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [operatorsRes, waterLevelsRes, settingsRes] = await Promise.all([
        axios.get('/api/operators'),
        axios.get('/api/water-levels'),
        axios.get('/api/settings')
      ]);

      const activeAlerts = waterLevelsRes.data.data.filter(record => record.isAlert).length;

      setStats({
        totalOperators: operatorsRes.data.count,
        totalRecords: waterLevelsRes.data.count,
        activeAlerts,
        criticalThreshold: settingsRes.data.data.criticalThreshold
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/water-levels/alerts');
      setAlerts(response.data.data.slice(0, 5)); // Get latest 5 alerts
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === `/admin${path}` ? 'active' : '';
  };

  return (
    <div className="dashboard">
      <Navbar title="Admin Dashboard" />
      
      <div className="dashboard-container">
        <div className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/admin" className={`nav-item ${isActive('')}`}>
              📊 Dashboard
            </Link>
            <Link to="/admin/operators" className={`nav-item ${isActive('/operators')}`}>
              👥 Operators
            </Link>
            <Link to="/admin/water-levels" className={`nav-item ${isActive('/water-levels')}`}>
              💧 Water Levels
            </Link>
            <Link to="/admin/settings" className={`nav-item ${isActive('/settings')}`}>
              ⚙️ Settings
            </Link>
          </nav>
        </div>

        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                      👥
                    </div>
                    <div className="stat-content">
                      <h3>Total Operators</h3>
                      <p>{stats.totalOperators}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ddd6fe' }}>
                      💧
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
                      <h3>Active Alerts</h3>
                      <p>{stats.activeAlerts}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                      📏
                    </div>
                    <div className="stat-content">
                      <h3>Critical Threshold</h3>
                      <p>{stats.criticalThreshold}m</p>
                    </div>
                  </div>
                </div>

                {alerts.length > 0 && (
                  <div className="card">
                    <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
                      🚨 Recent Alerts
                    </h2>
                    <div className="alerts-list">
                      {alerts.map((alert) => (
                        <div key={alert._id} className="alert alert-warning">
                          <div>
                            <strong>Water Level: {alert.level}m</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
                              Recorded on {new Date(alert.date).toLocaleString()} by {alert.recordedBy?.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card">
                  <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>
                    📋 Quick Actions
                  </h2>
                  <div className="quick-actions">
                    <Link to="/admin/operators" className="btn btn-primary">
                      Manage Operators
                    </Link>
                    <Link to="/admin/water-levels" className="btn btn-success">
                      View Water Levels
                    </Link>
                    <Link to="/admin/settings" className="btn btn-warning">
                      Update Settings
                    </Link>
                  </div>
                </div>
              </>
            } />
            <Route path="/operators" element={<OperatorManagement onUpdate={fetchStats} />} />
            <Route path="/water-levels" element={<WaterLevelHistory />} />
            <Route path="/settings" element={<Settings onUpdate={fetchStats} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;