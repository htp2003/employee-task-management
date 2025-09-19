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
        phoneNumber: ''
    });

    const loadProfile = async () => {
        console.log('loading profile...');

        const empData = localStorage.getItem('employeeData');
        if (!empData) {
            alert('Please login first');
            window.location.href = '/employee';
            return;
        }

        const emp = JSON.parse(empData);
        console.log('emp from storage:', emp);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/getProfile', {
                employeeId: emp.id
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

    const loadMyTasks = async () => {
        const empData = localStorage.getItem('employeeData');
        if (!empData) return;

        const emp = JSON.parse(empData);
        console.log('loading tasks for:', emp.id);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/getMyTasks', {
                employeeId: emp.id
            });

            console.log('got tasks:', res.data);

            if (res.data.tasks) {
                setTasks(res.data.tasks);
            } else {
                setTasks([]);
            }
        } catch (err) {
            console.log('tasks error:', err);
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
            const empData = JSON.parse(localStorage.getItem('employeeData'));
            const res = await axios.post('http://localhost:5000/api/employee/updateProfile', {
                employeeId: empData.id,
                ...formData
            });

            if (res.data.success) {
                console.log('profile updated');
                alert('Profile updated successfully!');
                setEditMode(false);
                loadProfile();
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.log('update error:', err);
            alert('Error updating profile');
        }

        setLoading(false);
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        console.log('updating task:', taskId, 'to:', newStatus);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/updateTaskStatus', {
                taskId: taskId,
                status: newStatus
            });

            if (res.data.success) {
                console.log('task updated');
                alert('Task status updated!');
                loadMyTasks();
            } else {
                alert('Update failed');
            }
        } catch (err) {
            console.log('task update error:', err);
            alert('Error updating task');
        }
    };

    const getStatusColor = (status) => {
        if (status === 'done') return '#28a745';
        if (status === 'in_progress') return '#ffc107';
        return '#6c757d';
    };

    const formatDate = (dateObj) => {
        console.log('formatting date:', dateObj);

        if (!dateObj) return 'No date';

        try {
            // firebase timestamp with underscore prefix
            if (dateObj._seconds) {
                const date = new Date(dateObj._seconds * 1000);
                return date.toLocaleDateString();
            }

            // firebase timestamp without underscore  
            if (dateObj.seconds) {
                const date = new Date(dateObj.seconds * 1000);
                return date.toLocaleDateString();
            }

            // if it's already a date string
            if (typeof dateObj === 'string') {
                const date = new Date(dateObj);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString();
                }
            }

            // regular date object
            if (dateObj instanceof Date) {
                return dateObj.toLocaleDateString();
            }

            // try converting to date
            const date = new Date(dateObj);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
            }

            return 'Invalid date';
        } catch (err) {
            console.log('date format error:', err);
            return 'Invalid date';
        }
    };


    useEffect(() => {
        console.log('employee dashboard loaded');
        loadProfile();
        loadMyTasks();
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

            {/* My Tasks */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>My Tasks ({tasks.length})</h2>

                {tasks.length === 0 ? (
                    <p style={{ color: '#666' }}>No tasks assigned yet</p>
                ) : (
                    <div>
                        {tasks.map((task, idx) => (
                            <div
                                key={task.id || idx}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{task.title}</h4>
                                {task.description && (
                                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                        {task.description}
                                    </p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#666' }}>
                                        <span><strong>Status:</strong>
                                            <span style={{
                                                color: getStatusColor(task.status),
                                                fontWeight: 'bold',
                                                marginLeft: '5px'
                                            }}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </span>
                                        {task.dueDate && (
                                            <span><strong>Due:</strong> {formatDate(task.dueDate)}</span>
                                        )}
                                        <span><strong>Assigned:</strong> {formatDate(task.createdAt)}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {task.status !== 'in_progress' && task.status !== 'done' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                style={{
                                                    backgroundColor: '#ffc107',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Start
                                            </button>
                                        )}
                                        {task.status !== 'done' && (
                                            <button
                                                onClick={() => updateTaskStatus(task.id, 'done')}
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard;