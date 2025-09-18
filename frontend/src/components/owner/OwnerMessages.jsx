import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../styles/chat.css';

function OwnerMessages() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [socket, setSocket] = useState(null);
    const msgEnd = useRef(null);

    const loadEmps = async () => {
        console.log('loading emps...');

        try {
            const res = await axios.get('http://localhost:5000/api/owner/getAllEmployees');

            if (res.data.employees) {
                setEmployees(res.data.employees);
                console.log('got emps:', res.data.employees.length);
            }
        } catch (err) {
            console.log('load error:', err);
        }
    };

    // socket stuff
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join_chat', {
            userId: 'owner',
            userType: 'owner'
        });

        newSocket.on('receive_message', (data) => {
            console.log('got msg:', data);
            setMessages(prev => [...prev, data]);
        });

        newSocket.on('message_sent', (data) => {
            console.log('msg sent ok');
        });

        newSocket.on('message_error', (error) => {
            console.log('msg failed:', error);
            alert('send failed');
        });

        return () => {
            newSocket.disconnect();
            console.log('socket closed');
        };
    }, []);

    useEffect(() => {
        if (msgEnd.current) {
            msgEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const selectEmp = (emp) => {
        console.log('selected:', emp.name);
        setSelectedEmp(emp);
        setMessages([]);

        if (socket) {
            socket.emit('join_chat_room', {
                ownerId: 'owner',
                employeeId: emp.id
            });

            socket.emit('get_chat_history', {
                userId: 'owner',
                userType: 'owner'
            });

            socket.on('chat_history', (msgs) => {
                console.log('loaded history:', msgs.length);
                const empMsgs = msgs.filter(msg =>
                    (msg.from === 'owner' && msg.to === emp.id) ||
                    (msg.from === emp.id && msg.to === 'owner')
                );
                setMessages(empMsgs);
            });
        }
    };

    const sendMsg = () => {
        if (!newMsg.trim() || !selectedEmp || !socket) return;

        console.log('sending to:', selectedEmp.name);

        const msgData = {
            from: 'owner',
            to: selectedEmp.id,
            message: newMsg.trim(),
            fromType: 'owner',
            toType: 'employee'
        };

        // add to UI first
        const tempMsg = {
            ...msgData,
            id: 'temp_' + Date.now(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);

        socket.emit('send_message', msgData);
        setNewMsg('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMsg();
        }
    };

    useEffect(() => {
        loadEmps();
    }, []);

    return (
        <div className="chat-box">
            {/* Employee list */}
            <div className="emp-sidebar">
                <div className="sidebar-top">
                    <h3>All Messages</h3>
                </div>

                <div className="emp-list">
                    {employees.length === 0 ? (
                        <p style={{ padding: '20px', color: '#666' }}>No employees</p>
                    ) : (
                        employees.map((emp) => (
                            <div
                                key={emp.id}
                                className={`emp-item ${selectedEmp?.id === emp.id ? 'active' : ''}`}
                                onClick={() => selectEmp(emp)}
                            >
                                <div className="emp-pic"></div>
                                <div className="emp-details">
                                    <div className="emp-name">{emp.name}</div>
                                    <div className="emp-role">{emp.role}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat area */}
            <div className="chat-main">
                {selectedEmp ? (
                    <>
                        <div className="chat-top">
                            <div className="user-info">
                                <div className="user-pic"></div>
                                <div>
                                    <div className="user-name">{selectedEmp.name}</div>
                                    <div className="user-role">Employee - {selectedEmp.role}</div>
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
                                        className={`msg ${msg.fromType === 'owner' ? 'owner-msg' : 'emp-msg'}`}
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
                                    onKeyPress={handleKeyPress}
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
                    </>
                ) : (
                    <div className="no-chat">
                        <p>Select employee to chat</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OwnerMessages;