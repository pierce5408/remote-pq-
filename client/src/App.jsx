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

  useEffect(() => {
    socket.connect();

    socket.on('room-joined', (data) => {
      setRoomData(data);
      setError('');

      // Auto re-pick saved color if available
      const savedColor = sessionStorage.getItem('myColor');
      if (savedColor) {
        const alreadyTaken = Object.entries(data.players)
          .some(([id, p]) => p.color === savedColor && id !== socket.id);
        if (!alreadyTaken) {
          socket.emit('pick-color', { color: savedColor });
        }
      }
    });

    socket.on('join-error', (msg) => {
      setError(msg);
      clearUrlParams();
      sessionStorage.clear();
    });

    socket.on('players-updated', (players) => {
      setRoomData(prev => prev ? { ...prev, players } : prev);
      if (players[socket.id]?.color) {
        setMyColor(players[socket.id].color);
        sessionStorage.setItem('myColor', players[socket.id].color);
      }
    });

    socket.on('table-updated', (table) => {
      setRoomData(prev => prev ? { ...prev, table } : prev);
    });

    // Auto-join from URL params after all listeners are registered
    const { room, pwd } = getUrlParams();
    if (room && pwd) {
      const doJoin = () => socket.emit('join-room', { roomId: room, password: pwd });
      if (socket.connected) {
        doJoin();
      } else {
        socket.once('connect', doJoin);
      }
    }

    return () => {
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('players-updated');
      socket.off('table-updated');
      socket.disconnect();
    };
  }, []);

  const handleJoin = (roomId, password) => {
    setError('');
    setUrlParams(roomId, password);
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
