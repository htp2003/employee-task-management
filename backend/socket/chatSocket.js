const { db } = require('../config/firebase');

// store online users
const onlineUsers = new Map();

const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('user connected:', socket.id);

        // user joins chat
        socket.on('join_chat', (data) => {
            const { userId, userType } = data;

            console.log(`${userType} ${userId} joined chat`);

            onlineUsers.set(socket.id, { userId, userType });

            const roomId = userType === 'owner' ? 'owner_room' : `employee_${userId}`;
            socket.join(roomId);

            console.log(`${userId} joined room: ${roomId}`);
            socket.broadcast.emit('user_online', { userId, userType });
        });

        // send message
        socket.on('send_message', async (messageData) => {
            const { from, to, message, fromType, toType } = messageData;

            console.log('message from:', from, 'to:', to);

            try {
                const messageDoc = await db.collection('messages').add({
                    from: from,
                    to: to,
                    message: message,
                    fromType: fromType,
                    toType: toType,
                    timestamp: new Date(),
                    read: false
                });

                console.log('message saved:', messageDoc.id);

                const roomName = fromType === 'owner' ?
                    `chat_owner_${to}` : `chat_owner_${from}`;

                const messageWithId = {
                    id: messageDoc.id,
                    from, to, message, fromType, toType,
                    timestamp: new Date(),
                    read: false
                };

                socket.emit('message_sent', messageWithId);
                socket.to(roomName).emit('receive_message', messageWithId);

                console.log('message sent to room:', roomName);

            } catch (error) {
                console.log('message error:', error);
                socket.emit('message_error', { error: 'send failed' });
            }
        });

        // join chat room
        socket.on('join_chat_room', (data) => {
            const { ownerId, employeeId } = data;
            const roomName = `chat_owner_${employeeId}`;

            socket.join(roomName);
            console.log(`joined room: ${roomName}`);

            socket.emit('room_joined', { room: roomName });
        });

        // get chat history
        socket.on('get_chat_history', async (data) => {
            const { userId, userType } = data;

            console.log('getting history for:', userId);

            try {
                let query;

                if (userType === 'owner') {
                    query = db.collection('messages')
                        .orderBy('timestamp', 'asc')
                        .limit(50);
                } else {
                    query = db.collection('messages')
                        .where('from', 'in', [userId, 'owner'])
                        .where('to', 'in', [userId, 'owner'])
                        .orderBy('timestamp', 'asc')
                        .limit(50);
                }

                const snapshot = await query.get();
                const messages = [];

                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp.toDate()
                    });
                });

                console.log('found messages:', messages.length);
                socket.emit('chat_history', messages);

            } catch (error) {
                console.log('history error:', error);
                socket.emit('chat_history_error', { error: 'load failed' });
            }
        });

        // typing events
        socket.on('typing', (data) => {
            socket.broadcast.emit('user_typing', data);
        });

        socket.on('stop_typing', (data) => {
            socket.broadcast.emit('user_stop_typing', data);
        });

        // disconnect
        socket.on('disconnect', () => {
            const user = onlineUsers.get(socket.id);

            if (user) {
                console.log('user left:', user.userId);
                socket.broadcast.emit('user_offline', {
                    userId: user.userId,
                    userType: user.userType
                });
                onlineUsers.delete(socket.id);
            } else {
                console.log('user disconnected:', socket.id);
            }
        });
    });
};

const getOnlineUsers = () => {
    return Array.from(onlineUsers.values());
};

module.exports = { setupChatSocket, getOnlineUsers };