import { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';

function OwnerDashboard() {
    const [employees, setEmployees] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

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

    const handleModalSubmit = async (formData) => {
        setLoading(true);
        console.log('submitting form...');

        if (selectedEmployee) {
            // update employee
            console.log('updating employee:', selectedEmployee.id);
            try {
                const response = await axios.post('http://localhost:5000/api/owner/updateEmployee', {
                    employeeId: selectedEmployee.id,
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    role: formData.role
                });

                if (response.data.success) {
                    alert('Employee updated!');
                    setShowModal(false);
                    setSelectedEmployee(null);
                    loadEmployees();
                } else {
                    alert('Update failed');
                }
            } catch (err) {
                console.log('update error:', err);
                alert('Error updating employee');
            }
        } else {
            // create new employee
            console.log('creating employee:', formData);
            try {
                const res = await axios.post('http://localhost:5000/api/owner/createEmployee', formData);

                if (res.data.success) {
                    console.log('employee created:', res.data.employeeId);
                    alert('Employee created successfully!');
                    setShowModal(false);
                    loadEmployees();
                } else {
                    alert('Failed to create employee');
                }
            } catch (error) {
                console.log('create error:', error);
                alert('Error creating employee');
            }
        }

        setLoading(false);
    };

    const openAddModal = () => {
        console.log('opening add modal');
        setSelectedEmployee(null);
        setShowModal(true);
    };

    const editEmp = (empId) => {
        console.log('editing employee:', empId);
        const employee = employees.find(emp => emp.id === empId);

        if (!employee) {
            alert('Employee not found');
            return;
        }

        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const closeModal = () => {
        console.log('closing modal');
        setShowModal(false);
        setSelectedEmployee(null);
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
                    onClick={openAddModal}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    Add Employee
                </button>
            </div>

            <EmployeeModal
                isOpen={showModal}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                employee={selectedEmployee}
                loading={loading}
            />

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
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{emp.role}</td>
                                    <td
                                        style={{
                                            padding: "8px",
                                            border: "1px solid #ddd",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                        }}
                                    >
                                        <button
                                            onClick={() => editEmp(emp.id)}
                                            style={{
                                                backgroundColor: "#ffc107",
                                                color: "black",
                                                border: "none",
                                                padding: "8px 12px",
                                                cursor: "pointer",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteEmp(emp.id, emp.name)}
                                            style={{
                                                backgroundColor: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 12px",
                                                cursor: "pointer",
                                                borderRadius: "4px"
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