import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PayrollPage.css';

function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    pharmacyId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    baseSalary: '',
    allowances: 0,
    bonus: 0,
    deductions: 0,
    taxDeduction: 0,
    paymentMethod: 'Bank Transfer',
  });

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operations/payroll');
      setPayrollRecords(response.data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operations/payroll', formData);
      setShowForm(false);
      setFormData({
        staffId: '',
        pharmacyId: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        baseSalary: '',
        allowances: 0,
        bonus: 0,
        deductions: 0,
        taxDeduction: 0,
        paymentMethod: 'Bank Transfer',
      });
      fetchPayroll();
    } catch (error) {
      console.error('Error creating payroll:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/operations/payroll/${id}/approve`);
      fetchPayroll();
    } catch (error) {
      console.error('Error approving payroll:', error);
    }
  };

  const handlePay = async (id) => {
    try {
      await axios.put(`/api/operations/payroll/${id}/pay`);
      fetchPayroll();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="payroll-page">
      <div className="page-header">
        <h1>Payroll Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Payroll'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Staff ID</label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pharmacy ID</label>
                <input
                  type="text"
                  name="pharmacyId"
                  value={formData.pharmacyId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pay Period Start</label>
                <input
                  type="date"
                  name="payPeriodStart"
                  value={formData.payPeriodStart}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pay Period End</label>
                <input
                  type="date"
                  name="payPeriodEnd"
                  value={formData.payPeriodEnd}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Base Salary</label>
                <input
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Allowances</label>
                <input
                  type="number"
                  name="allowances"
                  value={formData.allowances}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bonus</label>
                <input
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Deductions</label>
                <input
                  type="number"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax Deduction</label>
                <input
                  type="number"
                  name="taxDeduction"
                  value={formData.taxDeduction}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary">Create Payroll</button>
          </form>
        </div>
      )}

      <div className="payroll-table">
        {loading ? (
          <p>Loading...</p>
        ) : payrollRecords.length === 0 ? (
          <p>No payroll records found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Period</th>
                <th>Base Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.staffId}</td>
                  <td>{new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}</td>
                  <td>${parseFloat(record.baseSalary).toFixed(2)}</td>
                  <td>${parseFloat(record.allowances).toFixed(2)}</td>
                  <td>${parseFloat(record.deductions).toFixed(2)}</td>
                  <td className="net-salary">${parseFloat(record.netSalary).toFixed(2)}</td>
                  <td><span className={`status ${record.status.toLowerCase()}`}>{record.status}</span></td>
                  <td>
                    {record.status === 'Pending' && (
                      <>
                        <button className="btn-small" onClick={() => handleApprove(record.id)}>Approve</button>
                        <button className="btn-small btn-danger">Delete</button>
                      </>
                    )}
                    {record.status === 'Approved' && (
                      <button className="btn-small btn-success" onClick={() => handlePay(record.id)}>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PayrollPage;
