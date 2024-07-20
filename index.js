import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pg from 'pg';

const { Client } = pg;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// PostgreSQL connection
const db = new Client({
  user: 'postgres', // Update with your PostgreSQL username
  host: 'localhost',
  database: 'chat_app',
  password: '2020', // Update with your PostgreSQL password
  port: 5432,
});

db.connect();

// Serve static files
app.use(express.static('public'));

let users = {};
let roomUserCount = {};

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('joinRoom', async ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    // Increment room user count
    if (roomUserCount[room]) {
      roomUserCount[room]++;
    } else {
      roomUserCount[room] = 1;
    }

    // Send chat history
    const res = await db.query('SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC LIMIT 50', [room]);
    socket.emit('chatHistory', res.rows);

    // Notify users in the room
    io.to(room).emit('message', { username: 'Admin', message: `${username} has joined the chat` });

    // Emit updated user count for the room
    io.to(room).emit('userCount', { count: roomUserCount[room] });

    socket.on('chatMessage', async (msg) => {
      const res = await db.query('INSERT INTO messages (room, username, message) VALUES ($1, $2, $3) RETURNING *', [room, users[socket.id].username, msg]);
      io.to(room).emit('message', res.rows[0]);
    });

    socket.on('disconnect', () => {
      const { username, room } = users[socket.id];
      delete users[socket.id];

      // Decrement room user count
      if (roomUserCount[room]) {
        roomUserCount[room]--;
      }

      // Notify users in the room
      io.to(room).emit('message', { username: 'Admin', message: `${username} has left the chat` });

      // Emit updated user count for the room
      io.to(room).emit('userCount', { count: roomUserCount[room] });
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// import express from 'express';
    // import http from 'http';
    // import { Server } from 'socket.io';
    // import pg from 'pg';

    // const { Client } = pg;

    // const app = express();
    // const server = http.createServer(app);
    // const io = new Server(server);

    // // PostgreSQL connection
    // const db = new Client({
    // user: 'postgres', // Update with your PostgreSQL username
    // host: 'localhost',
    // database: 'chat_app',
    // password: '2020', // Update with your PostgreSQL password
    // port: 5432,
    // });

    // db.connect();

    // // Serve static files
    // app.use(express.static('public'));

    // let users = {};

    // // Socket.io connection
    // io.on('connection', (socket) => {
    // console.log('New WebSocket connection');

    // socket.on('joinRoom', async ({ username, room }) => {
    //     socket.join(room);
    //     users[socket.id] = { username, room };

    //     // Send chat history
    //     const res = await db.query('SELECT * FROM messages WHERE room = $1 ORDER BY timestamp ASC LIMIT 50', [room]);
    //     socket.emit('chatHistory', res.rows);

    //     // Broadcast when a user connects
    //     socket.broadcast.to(room).emit('message', { username: 'Admin', message: `${username} has joined the chat` });

    //     // Emit updated user count
    //     io.to(room).emit('userCount', { count: Object.keys(users).length });

    //     // Listen for chat messages
    //     socket.on('chatMessage', async (msg) => {
    //     const res = await db.query('INSERT INTO messages (room, username, message) VALUES ($1, $2, $3) RETURNING *', [room, users[socket.id].username, msg]);
    //     io.to(room).emit('message', res.rows[0]);
    //     });

    //     // Runs when client disconnects
    //     socket.on('disconnect', () => {
    //     const { username, room } = users[socket.id];
    //     delete users[socket.id];
    //     io.to(room).emit('message', { username: 'Admin', message: `${username} has left the chat` });
    //     // Emit updated user count
    //     io.to(room).emit('userCount', { count: Object.keys(users).length });
    //     });
    // });
    // });

    // const PORT = process.env.PORT || 3000;
    // server.listen(PORT, () => console.log(`Server running on port ${PORT}`));