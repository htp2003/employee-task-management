import { useState } from 'react';
import axios from 'axios';
import '../../styles/forms.css';


function PasswordLoginForm({ setError }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const loginPassword = async () => {
        if (!username || !password) {
            return setError('Please fill in username & password');
        }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/employee/loginPassword', {
                username,
                password
            });
            if (res.data.success) {
                localStorage.setItem('employeeData', JSON.stringify(res.data.employee));
                alert('login successful');
                window.location.href = '/employee/dashboard';
            } else {
                setError(res.data.error || 'Login failed');
            }
        } catch (err) {
            setError('server error');
        }
        setLoading(false);
    };

    return (
        <div className="form-group">
            <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
            />
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ marginTop: '10px' }}
            />
            <button
                onClick={loginPassword}
                className="btn-primary"
                disabled={loading}
                style={{ marginTop: '10px' }}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </div>
    );
}

export default PasswordLoginForm;