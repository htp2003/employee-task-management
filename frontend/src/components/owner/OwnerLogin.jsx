import { useState } from "react";
import axios from "axios";
import '../../styles/forms.css';

function OwnerLogin() {
    const [phoneNumber, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const sendCode = async () => {
        if (!phoneNumber) {
            setError('need phoneNumber number');
            return;
        }

        setLoading(true);
        console.log('sending code to:', phoneNumber);

        try {
            const response = await axios.post("http://localhost:5000/api/owner/createNewAccessCode", {
                phoneNumber: phoneNumber
            });

            console.log('response:', response.data);

            if (response.data.success) {
                setStep(2);
                setError("");
                console.log('code sent successfully');
            } else {
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
            const res = await axios.post("http://localhost:5000/api/owner/validateAccessCode", {
                phoneNumber: phoneNumber,
                accessCode: code
            });

            if (res.data.success) {
                console.log('login success');
                localStorage.setItem('ownerPhone', phoneNumber);
                alert("Login successful!");
                window.location.href = '/owner/dashboard';
            } else {
                console.log('wrong code');
                setError('code is wrong');
            }
        } catch (error) {
            console.log('verify failed:', error);
            setError('validation error');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Owner Login</h2>

                {error && <div className="error-msg">{error}</div>}

                {step === 1 ? (
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter phoneNumber number"
                            value={phoneNumber}
                            onChange={(e) => setPhone(e.target.value)}
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
                    </div>
                ) : (
                    <div className="form-group">
                        <p>Code sent to {phoneNumber}</p>
                        <input
                            type="text"
                            placeholder="Enter access code"
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
                            {loading ? "Checking..." : "Verify"}
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

export default OwnerLogin;