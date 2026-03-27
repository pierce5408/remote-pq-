import { useState, useEffect } from 'react';
import { socket } from './socket';
import LandingPage from './components/LandingPage';
import GameRoom from './components/GameRoom';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return { room: params.get('room'), pwd: params.get('pwd') };
}

function setUrlParams(roomId, password) {
  const params = new URLSearchParams({ room: roomId, pwd: password });
  window.history.replaceState(null, '', '?' + params.toString());
}

function clearUrlParams() {
  window.history.replaceState(null, '', window.location.pathname);
}

function App() {
  const [roomData, setRoomData] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [error, setError] = useState('');
  const [pendingJoin, setPendingJoin] = useState(null);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      // Auto-join from URL params after socket connects
      const { room, pwd } = getUrlParams();
      if (room && pwd) {
        socket.emit('join-room', { roomId: room, password: pwd });
      }
    });

    socket.on('room-joined', (data) => {
      setRoomData(data);
      setError('');
      if (pendingJoin) {
        setUrlParams(pendingJoin.roomId, pendingJoin.password);
        setPendingJoin(null);
      }
    });

    socket.on('join-error', (msg) => {
      setError(msg);
      clearUrlParams();
    });

    socket.on('players-updated', (players) => {
      setRoomData(prev => prev ? { ...prev, players } : prev);
      if (players[socket.id]) {
        setMyColor(players[socket.id].color);
      }
    });

    socket.on('table-updated', (table) => {
      setRoomData(prev => prev ? { ...prev, table } : prev);
    });

    return () => {
      socket.off('connect');
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('players-updated');
      socket.off('table-updated');
      socket.disconnect();
    };
  }, []);

  const handleJoin = (roomId, password) => {
    setError('');
    setPendingJoin({ roomId, password });
    socket.emit('join-room', { roomId, password });
  };

  const handlePickColor = (color) => {
    socket.emit('pick-color', { color });
  };

  const handleToggleCell = (rowIndex, colIndex) => {
    socket.emit('toggle-cell', { rowIndex, colIndex });
  };

  const handleReset = () => {
    socket.emit('reset-table');
  };

  if (!roomData) {
    return <LandingPage onJoin={handleJoin} error={error} />;
  }

  return (
    <GameRoom
      roomData={roomData}
      myColor={myColor}
      mySocketId={socket.id}
      onPickColor={handlePickColor}
      onToggleCell={handleToggleCell}
      onReset={handleReset}
      error={error}
    />
  );
}

export default App;
