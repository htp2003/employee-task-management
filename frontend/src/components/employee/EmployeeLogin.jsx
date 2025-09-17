import { useState } from "react";
import axios from "axios";
import '../../styles/forms.css';

function EmployeeLogin() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const sendCode = async () => {
        if (!email) {
            alert('please fill in your email');
            return;
        }

        setLoading(true);
        console.log('sending code to:', email);

        try {
            const response = await axios.post('http://localhost:5000/api/employee/loginEmail', {
                email: email
            });

            console.log('response:', response.data);

            if (response.data.success) {
                setStep(2);
                setError('');
                console.log('code sent to email');
            } else {
                console.log('code send failed');
                setError('failed to send code');
            }
        } catch (err) {
            console.log('send error:', err);
            setError('server problem');
        }

        setLoading(false);
    };

    const verifyCode = async () => {
        if (!code) return setError('enter code');

        setLoading(true);
        console.log('checking code:', code);

        try {
            const res = await axios.post('http://localhost:5000/api/employee/validateAccessCode', {
                email: email,
                accessCode: code
            });

            console.log('verify response:', res.data);

            if (res.data.success) {
                console.log('employee login success');
                localStorage.setItem('employeeData', JSON.stringify(res.data.employee));
                alert('login successful');
                window.location.href = '/employee/dashboard';
            } else {
                console.log('verify failed');
                setError('code is wrong');
            }
        } catch (err) {
            console.log('verify error:', err);
            setError('validation failed');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Employee Login</h2>

                {error && <div className="error-msg">{error}</div>}

                {step === 1 ? (
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
                )}
            </div>
        </div>
    );
}

export default EmployeeLogin;