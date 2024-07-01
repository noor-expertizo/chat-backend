const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://noorulainsiddiqui40:noorsiddiqui40@cluster0.zmn2nmz.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Message Schema
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.io events
io.on('connection', (socket) => {
    console.log('New client connected');

    // Send all previous messages
    Message.find().then(messages => {
        socket.emit('init', messages);
    });

    // Listen for new messages
    socket.on('message', (data) => {
        const newMessage = new Message(data);
        newMessage.save().then(() => {
            io.emit('message', data);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
