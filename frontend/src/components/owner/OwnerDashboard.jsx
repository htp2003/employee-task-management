import { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerDashboard() {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: ''
    });

    const loadEmployees = async () => {
        console.log('loading employees...');

        try {
            const response = await axios.get('http://localhost:5000/api/owner/getAllEmployees');
            console.log('got employees:', response.data);

            if (response.data.employees) {
                setEmployees(response.data.employees);
            } else {
                console.log('no employees found');
                setEmployees([]);
            }
        } catch (err) {
            console.log('load error:', err);
            alert('Failed to load employees');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.role) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        console.log('creating employee:', formData);

        try {
            const res = await axios.post('http://localhost:5000/api/owner/createEmployee', formData);

            if (res.data.success) {
                console.log('employee created:', res.data.employeeId);
                alert('Employee created successfully!');
                setFormData({ name: '', email: '', phoneNumber: '', role: '' });
                setShowForm(false);
                loadEmployees(); // reload list
            } else {
                alert('Failed to create employee');
            }
        } catch (error) {
            console.log('create error:', error);
            alert('Error creating employee');
        }

        setLoading(false);
    };

    const deleteEmp = async (empId, empName) => {
        if (!confirm(`Delete ${empName}?`)) return;

        console.log('deleting:', empId);

        try {
            const response = await axios.post('http://localhost:5000/api/owner/deleteEmployee', {
                employeeId: empId
            });

            if (response.data.success) {
                console.log('deleted successfully');
                alert('Employee deleted');
                loadEmployees();
            } else {
                alert('Delete failed');
            }
        } catch (err) {
            console.log('delete error:', err);
            alert('Error deleting employee');
        }
    };

    const logout = () => {
        localStorage.removeItem('ownerPhone');
        window.location.href = '/';
    };

    useEffect(() => {
        console.log('dashboard loaded');
        loadEmployees();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Employee Management</h1>

            </div>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? 'Cancel' : 'Add Employee'}
                </button>
            </div>

            {showForm && (
                <div className="form-container" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
                    <h3>Add New Employee</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="form-input"
                            style={{ backgroundColor: 'white' }}
                        >
                            <option value="">Select Role</option>
                            <option value="Manager">Manager</option>
                            <option value="Developer">Developer</option>
                            <option value="Designer">Designer</option>
                            <option value="Tester">Tester</option>
                            <option value="Analyst">Analyst</option>
                            <option value="Support">Support</option>
                            <option value="HR">HR</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-success"
                    >
                        {loading ? 'Creating...' : 'Create Employee'}
                    </button>
                </div>
            )}

            <div className="employee-list">
                <h2>Employee List ({employees.length})</h2>

                {employees.length === 0 ? (
                    <p>No employees found</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
                                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, index) => (
                                <tr key={emp.id || index}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emp.name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emp.email}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emp.phoneNumber}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                        <button
                                            onClick={() => deleteEmp(emp.id, emp.name)}
                                            style={{
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
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

export default OwnerDashboard;