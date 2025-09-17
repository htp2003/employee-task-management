import { useState, useEffect } from "react";
import axios from 'axios';

function EmployeeDashboard() {
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: ''
    });

    const loadProfile = async () => {
        console.log('loading profile...');

        //get employee from db
        const employeeData = localStorage.getItem('employeeData');
        if (!employeeData) {
            alert('Please login first');
            window.location.href = '/employee';
            return;
        }

        const employee = JSON.parse(employeeData);
        console.log('employee from storage:', employee);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/getProfile', {
                employeeId: employee.id
            });

            console.log('got profile:', res.data);

            if (res.data.profile) {
                setProfile(res.data.profile);
                setFormData({
                    name: res.data.profile.name || '',
                    email: res.data.profile.email || '',
                    phoneNumber: res.data.profile.phoneNumber || ''
                });
            } else {
                console.log('no profile found');
                setError('Profile not found');
            }
        } catch (err) {
            console.log('load error:', err);
            setError('Failed to load profile');
        }
    };

    const updateProfile = async () => {
        if (!formData.name || !formData.email || !formData.phoneNumber) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        console.log('updating profile:', formData);

        try {
            const employeeData = JSON.parse(localStorage.getItem('employeeData'));
            const res = await axios.post('http://localhost:5000/api/employee/updateProfile', {
                employeeId: employeeData.id,
                ...formData
            });

            if (res.data.success) {
                console.log('profile updated');
                alert('Profile updated successfully!');
                setEditMode(false);
                loadProfile(); // reload profile
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.log('update error:', err);
            alert('Error updating profile');
        }

        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('employeeData');
        window.location.href = '/employee';
    };

    useEffect(() => {
        console.log('employee dashboard loaded');
        loadProfile();
    }, []);

    if (!profile) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Employee Dashboard</h1>
                <button onClick={logout} className="btn-secondary">
                    Logout
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Profile */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>My Profile</h2>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="btn-primary"
                        style={{ padding: '8px 15px' }}
                    >
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {editMode ? (
                    <div style={{ marginTop: '15px' }}>
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number:</label>
                            <input
                                type="text"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            className="btn-success"
                            style={{ marginTop: '10px' }}
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: '15px' }}>
                        <p><strong>Employee ID:</strong> {profile.id}</p>
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.phoneNumber}</p>
                        <p><strong>Role:</strong> {profile.role}</p>

                    </div>
                )}
            </div>

            {/* tasks section - placeholder */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>My Tasks</h2>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                    Task management feature will be implemented later.
                </p>

                {/* Mock tasks */}
                <div style={{ marginTop: '15px' }}>
                    <div style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '4px' }}>
                        <p><strong>Sample Task 1:</strong> Complete project documentation</p>
                        <p style={{ fontSize: '14px', color: '#666' }}>Status: In Progress</p>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '4px' }}>
                        <p><strong>Sample Task 2:</strong> Review code changes</p>
                        <p style={{ fontSize: '14px', color: '#666' }}>Status: Pending</p>
                    </div>
                </div>
            </div>

            {/* chat Section - Placeholder */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Chat with Owner</h2>
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                    Real-time chat feature will be implemented next.
                </p>
                <div style={{
                    height: '200px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '10px'
                }}>
                    <p>Chat interface coming soon...</p>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;