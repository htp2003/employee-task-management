import { useState, useEffect } from 'react';

function EmployeeModal({ isOpen, onClose, onSubmit, employee, loading }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: ''
    });

    // update form when employee prop changes
    useEffect(() => {
        if (employee) {
            console.log('setting form data for edit:', employee);
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                role: employee.role || ''
            });
        } else {
            console.log('clearing form data for add');
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                role: ''
            });
        }
    }, [employee]);

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.role) {
            alert('Please fill all fields');
            return;
        }
        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({ name: '', email: '', phoneNumber: '', role: '' });
        onClose();
    };

    if (!isOpen) return null;

    const isEdit = employee && employee.id;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                width: '500px',
                maxWidth: '90%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>{isEdit ? 'Edit Employee' : 'Add New Employee'}</h3>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box'
                        }}
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

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Employee' : 'Create Employee')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmployeeModal;