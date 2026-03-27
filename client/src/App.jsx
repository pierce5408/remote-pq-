import { useState, useEffect } from 'react';
import { socket } from './socket';
import LandingPage from './components/LandingPage';
import GameRoom from './components/GameRoom';

function App() {
  const [roomData, setRoomData] = useState(null); // { roomId, players, table }
  const [myColor, setMyColor] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    socket.connect();

    socket.on('room-joined', (data) => {
      setRoomData(data);
      setError('');
    });

    socket.on('join-error', (msg) => {
      setError(msg);
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
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('players-updated');
      socket.off('table-updated');
      socket.disconnect();
    };
  }, []);

  const handleJoin = (roomId, password) => {
    setError('');
    socket.emit('join-room', { roomId, password });
  };

  const handlePickColor = (color) => {
    socket.emit('pick-color', { color });
  };

  const handleToggleCell = (rowIndex, colIndex) => {
    socket.emit('toggle-cell', { rowIndex, colIndex });
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
      error={error}
    />
  );
}

export default App;
