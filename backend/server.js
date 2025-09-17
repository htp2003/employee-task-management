const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// socket setup
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173', // vite port
        methods: ['GET', 'POST']
    }
});

// basic middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/owner', require('./routes/owner'));
app.use('/api/employee', require('./routes/employee'));

// simple test route
app.get('/', (req, res) => {
    res.json({ message: 'server works' });
});

// socket connection
io.on('connection', (socket) => {
    console.log('user connected:', socket.id);

    // handle disconnect
    socket.on('disconnect', () => {
        console.log('user left:', socket.id);
    });

    // TODO: add chat events here later
});

// start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log('server running on', port);
});