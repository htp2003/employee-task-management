import { useState } from "react";
import axios from "axios";
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

function EmployeeLogin() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const [loginMethod, setLoginMethod] = useState('email');

    const sendCode = async () => {
        if (!email) {
            alert('please fill in your email');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/employee/loginEmail', { email });
            if (response.data.success) {
                setStep(2);
                setError('');
            } else {
                setError('failed to send code');
            }
        } catch (err) {
            setError('server problem');
        }
        setLoading(false);
    };

    const verifyCode = async () => {
        if (!code) return setError('enter code');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/employee/validateAccessCode', {
                email: email,
                accessCode: code
            });
            if (res.data.success) {
                localStorage.setItem('employeeData', JSON.stringify(res.data.employee));
                alert('login successful');
                window.location.href = '/employee/dashboard';
            } else {
                setError('code is wrong');
            }
        } catch (err) {
            setError('validation failed');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Employee Login</h2>
                {error && <div className="error-msg">{error}</div>}

                <div className="login-tabs">
                    <div
                        className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                    >
                        Login by Email Code
                    </div>
                    <div
                        className={`login-tab ${loginMethod === 'password' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('password')}
                    >
                        Login by Username/Password
                    </div>
                </div>

                {loginMethod === 'email' ? (
                    step === 1 ? (
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                disabled={loading}
                            />
                            <button
                                onClick={sendCode}
                                className="btn-primary"
                                disabled={loading}
                                style={{ marginTop: '10px' }}
                            >
                                {loading ? "Sending..." : "Send Code"}
                            </button>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <p>Owner? <a href="/" style={{ color: '#007bff' }}>Login here</a></p>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <p>Code sent to {email}</p>
                            <input
                                type="text"
                                placeholder="Enter access code from email"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="form-input"
                                disabled={loading}
                            />
                            <button
                                onClick={verifyCode}
                                className="btn-success"
                                disabled={loading}
                                style={{ marginTop: '10px' }}
                            >
                                {loading ? "Verifying..." : "Login"}
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="btn-secondary"
                                style={{ marginTop: '5px' }}
                            >
                                Back
                            </button>
                        </div>
                    )
                ) : (
                    <PasswordLoginForm setError={setError} />
                )}
            </div>
        </div>
    );
}

export default EmployeeLogin;