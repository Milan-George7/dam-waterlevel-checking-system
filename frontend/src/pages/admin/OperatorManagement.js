import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OperatorManagement = ({ onUpdate }) => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operators');
      setOperators(response.data.data);
    } catch (error) {
      setError('Failed to fetch operators');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (operator = null) => {
    if (operator) {
      setEditingOperator(operator);
      setFormData({
        email: operator.email,
        password: '',
        phoneNumber: operator.phoneNumber || ''
      });
    } else {
      setEditingOperator(null);
      setFormData({
        email: '',
        password: '',
        phoneNumber: ''
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOperator(null);
    setFormData({ email: '', password: '', phoneNumber: '' });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Email must contain @');
      return false;
    }

    if (!editingOperator && !formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.phoneNumber && !/^\d{1,10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be maximum 10 digits');
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
      if (editingOperator) {
        await axios.put(`/api/operators/${editingOperator._id}`, formData);
        setSuccess('Operator updated successfully');
      } else {
        await axios.post('/api/operators', formData);
        setSuccess('Operator added successfully');
      }

      fetchOperators();
      if (onUpdate) onUpdate();
      handleCloseModal();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this operator?')) {
      return;
    }

    try {
      await axios.delete(`/api/operators/${id}`);
      setSuccess('Operator deleted successfully');
      fetchOperators();
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredOperators = operators.filter(op =>
    op.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (op.phoneNumber && op.phoneNumber.includes(searchTerm))
  );

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1f2937' }}>👥 Operator Management</h2>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Add Operator
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

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                    No operators found
                  </td>
                </tr>
              ) : (
                filteredOperators.map((operator) => (
                  <tr key={operator._id}>
                    <td>{operator.email}</td>
                    <td>{operator.phoneNumber || 'N/A'}</td>
                    <td>{new Date(operator.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(operator)}
                        className="btn btn-warning"
                        style={{ marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(operator._id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingOperator ? 'Edit Operator' : 'Add Operator'}</h2>
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
                <label>Email *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="operator@example.com"
                />
              </div>

              <div className="form-group">
                <label>Password {!editingOperator && '*'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingOperator ? 'Leave blank to keep current' : 'Enter password'}
                />
              </div>

              <div className="form-group">
                <label>Phone Number (Max 10 digits)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="1234567890"
                  maxLength="10"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOperator ? 'Update' : 'Add'} Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorManagement;