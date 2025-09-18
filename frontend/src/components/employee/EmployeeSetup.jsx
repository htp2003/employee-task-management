import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useSearchParams } from "react-router-dom";
import '../../styles/forms.css';

function EmployeeSetup() {
    const [employee, setEmployee] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('invalid setup link');
            return;
        }
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await axios.post(`http://localhost:5000/api/employee/verifySetupToken/${token}`);

            if (response.data.valid) {
                setEmployee(response.data.employee);
            } else {
                setError(response.data.error)
            }
        } catch (error) {
            setError('fail to verify setup link')
        }
    }

    const handleSubmit = async () => {
        if (!formData.username || !formData.password) {
            setError('Please fill all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/setupAccount', {
                token: token,
                username: formData.username,
                password: formData.password
            });

            if (res.data.success) {
                alert('Account setup successfully! You can now login.');
                navigate('/employee');
            } else {
                setError(res.data.error);
            }
        } catch (err) {
            setError('Setup failed. Please try again.');
        }

        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Employee Account Setup</h2>

                {error && <div className="error-msg">{error}</div>}

                {employee ? (
                    <div className="form-group">
                        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                            Welcome <strong>{employee.name}</strong>!<br />
                            Setup your account credentials
                        </p>

                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            disabled={loading}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            style={{ marginTop: '10px' }}
                            disabled={loading}
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="form-input"
                            style={{ marginTop: '10px' }}
                            disabled={loading}
                        />

                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={loading}
                            style={{ marginTop: '15px' }}
                        >
                            {loading ? "Setting up..." : "Complete Setup"}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Already have an account? <a href="/employee" style={{ color: '#007bff' }}>Login here</a>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <p>Verifying setup link...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeSetup;