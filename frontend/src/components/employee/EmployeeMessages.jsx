import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../../styles/chat.css';

function EmployeeMessages() {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [socket, setSocket] = useState(null);
    const [emp, setEmp] = useState(null);
    const msgEnd = useRef(null);

    const getEmpData = () => {
        const data = localStorage.getItem('employeeData');
        if (!data) {
            console.log('no emp data');
            window.location.href = '/employee';
            return null;
        }

        const empData = JSON.parse(data);
        console.log('emp data:', empData);
        return empData;
    };

    useEffect(() => {
        const empData = getEmpData();
        if (!empData) return;

        setEmp(empData);

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        console.log('connecting emp:', empData.id);

        newSocket.emit('join_chat', {
            userId: empData.id,
            userType: 'employee'
        });

        newSocket.emit('join_chat_room', {
            ownerId: 'owner',
            employeeId: empData.id
        });

        // Fix: Get history after joining rooms
        setTimeout(() => {
            newSocket.emit('get_chat_history', {
                userId: empData.id,
                userType: 'employee'
            });
        }, 100);

        newSocket.on('chat_history', (msgs) => {
            console.log('loaded history:', msgs.length);
            console.log('all msgs:', msgs);

            // Fix: Filter messages properly for this employee
            const empMsgs = msgs.filter(msg => {
                const isForThisEmp =
                    (msg.from === 'owner' && msg.to === empData.id) ||
                    (msg.from === empData.id && msg.to === 'owner');

                console.log('checking msg:', msg, 'isForThisEmp:', isForThisEmp);
                return isForThisEmp;
            });

            console.log('filtered msgs for emp:', empMsgs.length);
            setMessages(empMsgs);
        });

        newSocket.on('receive_message', (data) => {
            console.log('got new msg:', data);
            // Check if message is for this employee
            if ((data.from === 'owner' && data.to === empData.id) ||
                (data.from === empData.id && data.to === 'owner')) {
                setMessages(prev => [...prev, data]);
            }
        });

        newSocket.on('message_sent', (data) => {
            console.log('msg sent');
        });

        newSocket.on('message_error', (err) => {
            console.log('msg error:', err);
            alert('send failed');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMsg = () => {
        if (!newMsg.trim() || !emp || !socket) return;

        console.log('sending to owner');

        const msgData = {
            from: emp.id,
            to: 'owner',
            message: newMsg.trim(),
            fromType: 'employee',
            toType: 'owner'
        };

        const tempMsg = {
            ...msgData,
            id: 'temp_' + Date.now(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);

        socket.emit('send_message', msgData);
        setNewMsg('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMsg();
        }
    };

    if (!emp) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="emp-chat-box">
            <div className="chat-top">
                <div className="user-info">
                    <div className="user-pic"></div>
                    <div>
                        <div className="user-name">Owner</div>
                        <div className="user-role">Manager</div>
                    </div>
                </div>
            </div>

            <div className="msg-area">
                {messages.length === 0 ? (
                    <div className="no-msgs">
                        <p>No messages yet</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={msg.id || idx}
                            className={`msg ${msg.fromType === 'employee' ? 'owner-msg' : 'emp-msg'}`}
                        >
                            <div className="msg-bubble">
                                <p>{msg.message}</p>
                                <span className="msg-time">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={msgEnd} />
            </div>

            <div className="input-area">
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Type message"
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyPress={handleKey}
                        className="msg-input"
                    />
                    <button
                        onClick={sendMsg}
                        disabled={!newMsg.trim()}
                        className="send-btn"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmployeeMessages;