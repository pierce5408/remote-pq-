const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// { roomId: { password, players: { socketId: { color } }, table: (string|null)[][] } }
// table[10][4]: 10 rows x 4 cols, value = color string or null
const rooms = {};

const COLORS = ['red', 'blue', 'green', 'yellow'];

function getRoomState(roomId) {
  const room = rooms[roomId];
  return {
    players: room.players,
    table: room.table
  };
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join-room', ({ roomId, password }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        password,
        players: {},
        table: Array(10).fill(null).map(() => Array(4).fill(null))
      };
    }

    if (rooms[roomId].password !== password) {
      socket.emit('join-error', '密碼錯誤');
      return;
    }

    const playerCount = Object.keys(rooms[roomId].players).length;
    if (playerCount >= 4) {
      socket.emit('join-error', '房間已滿（最多 4 人）');
      return;
    }

    socket.join(roomId);
    socket.roomId = roomId;
    rooms[roomId].players[socket.id] = { color: null };

    socket.emit('room-joined', { roomId, ...getRoomState(roomId) });
    io.to(roomId).emit('players-updated', rooms[roomId].players);
  });

  socket.on('pick-color', ({ color }) => {
    const roomId = socket.roomId;
    if (!roomId || !rooms[roomId]) return;

    // Check if taken by someone else
    const takenByOther = Object.entries(rooms[roomId].players)
      .some(([id, p]) => p.color === color && id !== socket.id);
    if (takenByOther) {
      socket.emit('join-error', '此顏色已被選取');
      return;
    }

    // Clear old color from table when switching
    const oldColor = rooms[roomId].players[socket.id].color;
    if (oldColor && oldColor !== color) {
      const table = rooms[roomId].table;
      for (let r = 0; r < table.length; r++) {
        for (let c = 0; c < table[r].length; c++) {
          if (table[r][c] === oldColor) table[r][c] = null;
        }
      }
      io.to(roomId).emit('table-updated', rooms[roomId].table);
    }

    rooms[roomId].players[socket.id].color = color;
    io.to(roomId).emit('players-updated', rooms[roomId].players);
  });

  socket.on('reset-table', () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms[roomId]) return;

    rooms[roomId].table = Array(10).fill(null).map(() => Array(4).fill(null));
    io.to(roomId).emit('table-updated', rooms[roomId].table);
  });

  // toggle-cell: rowIndex (0-9), colIndex (0-3)
  socket.on('toggle-cell', ({ rowIndex, colIndex }) => {
    const roomId = socket.roomId;
    if (!roomId || !rooms[roomId]) return;

    const player = rooms[roomId].players[socket.id];
    if (!player || !player.color) return;

    const table = rooms[roomId].table;
    const cell = table[rowIndex][colIndex];

    // Clear existing selection by this player in the same row only
    for (let c = 0; c < table[rowIndex].length; c++) {
      if (table[rowIndex][c] === player.color) {
        table[rowIndex][c] = null;
      }
    }

    // If the clicked cell wasn't theirs → claim it; if it was → just clear (toggle off)
    if (cell !== player.color) {
      table[rowIndex][colIndex] = player.color;
    }

    io.to(roomId).emit('table-updated', table);
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms[roomId]) return;

    delete rooms[roomId].players[socket.id];

    if (Object.keys(rooms[roomId].players).length === 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted (empty)`);
    } else {
      io.to(roomId).emit('players-updated', rooms[roomId].players);
    }
  });
});

app.get('/', (_, res) => res.send('Romeo server running'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
