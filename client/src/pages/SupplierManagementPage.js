import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SupplierManagementPage.css';

function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeTab, setActiveTab] = useState('suppliers');
  
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    paymentTerms: '',
    pharmacyId: '',
  });

  const [orderForm, setOrderForm] = useState({
    supplierId: '',
    pharmacyId: '',
    expectedDeliveryDate: '',
    totalAmount: '',
    paymentMethod: 'Bank Transfer',
  });

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operations/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/operations/supplier-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operations/suppliers', supplierForm);
      setShowSupplierForm(false);
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        contactPerson: '',
        paymentTerms: '',
        pharmacyId: '',
      });
      fetchSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/operations/supplier-orders', orderForm);
      setShowOrderForm(false);
      setOrderForm({
        supplierId: '',
        pharmacyId: '',
        expectedDeliveryDate: '',
        totalAmount: '',
        paymentMethod: 'Bank Transfer',
      });
      fetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleOrderStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/operations/supplier-orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <div className="supplier-management-page">
      <div className="page-header">
        <h1>Supplier Management</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders & Invoices
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <>
          <button className="btn-primary" onClick={() => setShowSupplierForm(!showSupplierForm)}>
            {showSupplierForm ? 'Cancel' : 'Add New Supplier'}
          </button>

          {showSupplierForm && (
            <div className="form-container">
              <form onSubmit={handleSupplierSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Supplier Name</label>
                    <input
                      type="text"
                      name="name"
                      value={supplierForm.name}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={supplierForm.email}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={supplierForm.phone}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={supplierForm.contactPerson}
                      onChange={handleSupplierInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={supplierForm.address}
                      onChange={handleSupplierInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={supplierForm.city}
                      onChange={handleSupplierInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={supplierForm.country}
                      onChange={handleSupplierInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Terms</label>
                    <input
                      type="text"
                      name="paymentTerms"
                      value={supplierForm.paymentTerms}
                      onChange={handleSupplierInputChange}
                      placeholder="e.g., Net 30"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">Add Supplier</button>
              </form>
            </div>
          )}

          <div className="suppliers-table">
            {loading ? (
              <p>Loading...</p>
            ) : suppliers.length === 0 ? (
              <p>No suppliers found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td>{supplier.name}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.address}</td>
                      <td><span className={`status ${supplier.status.toLowerCase()}`}>{supplier.status}</span></td>
                      <td>{'⭐'.repeat(Math.round(supplier.rating))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <button className="btn-primary" onClick={() => setShowOrderForm(!showOrderForm)}>
            {showOrderForm ? 'Cancel' : 'Create New Order'}
          </button>

          {showOrderForm && (
            <div className="form-container">
              <form onSubmit={handleOrderSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Supplier ID</label>
                    <input
                      type="text"
                      name="supplierId"
                      value={orderForm.supplierId}
                      onChange={handleOrderInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pharmacy ID</label>
                    <input
                      type="text"
                      name="pharmacyId"
                      value={orderForm.pharmacyId}
                      onChange={handleOrderInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expected Delivery Date</label>
                    <input
                      type="date"
                      name="expectedDeliveryDate"
                      value={orderForm.expectedDeliveryDate}
                      onChange={handleOrderInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Amount</label>
                    <input
                      type="number"
                      name="totalAmount"
                      value={orderForm.totalAmount}
                      onChange={handleOrderInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">Create Order</button>
              </form>
            </div>
          )}

          <div className="orders-table">
            {loading ? (
              <p>Loading...</p>
            ) : orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Supplier</th>
                    <th>Total Amount</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.supplierId}</td>
                      <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>
                        <select 
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td><span className={`status ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SupplierManagementPage;
