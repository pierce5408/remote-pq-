import { useState, useEffect, useRef } from 'react';
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

function getPersistentId() {
  let id = localStorage.getItem('persistentId');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    localStorage.setItem('persistentId', id);
  }
  return id;
}

function App() {
  const [roomData, setRoomData] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [error, setError] = useState('');
  const { room: urlRoom, pwd: urlPwd } = getUrlParams();
  const [loading, setLoading] = useState(!!urlRoom && !!urlPwd);
  const [joining, setJoining] = useState(false);
  const joinTimerRef = useRef(null);

  const persistentId = getPersistentId();

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

  useEffect(() => {
    const pingInterval = setInterval(() => {
      fetch(SOCKET_URL).catch(() => {});
    }, 5 * 60 * 1000);

    socket.connect();

    socket.on('room-joined', (data) => {
      clearTimeout(joinTimerRef.current);
      setRoomData(data);
      setLoading(false);
      setJoining(false);
      setError('');
      const myPlayer = data.players[socket.id];
      if (myPlayer?.color) setMyColor(myPlayer.color);
    });

    socket.on('join-error', (msg) => {
      clearTimeout(joinTimerRef.current);
      setError(msg);
      setLoading(false);
      setJoining(false);
      clearUrlParams();
    });

    socket.on('players-updated', (players) => {
      setRoomData(prev => prev ? { ...prev, players } : prev);
      const color = players[socket.id]?.color;
      if (color) setMyColor(color);
    });

    socket.on('table-updated', (table) => {
      setRoomData(prev => prev ? { ...prev, table } : prev);
    });

    // Auto-join from URL params
    const { room, pwd } = getUrlParams();
    if (room && pwd) {
      const doJoin = () => socket.emit('join-room', { roomId: room, password: pwd, persistentId });
      if (socket.connected) doJoin();
      else socket.once('connect', doJoin);
    }

    return () => {
      clearInterval(pingInterval);
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('players-updated');
      socket.off('table-updated');
      socket.disconnect();
    };
  }, []);

  const handleJoin = (roomId, password) => {
    setError('');
    setJoining(true);
    setUrlParams(roomId, password);
    socket.emit('join-room', { roomId, password, persistentId });

    joinTimerRef.current = setTimeout(() => {
      setJoining(false);
      setError('伺服器啟動中，請稍後再試一次（免費伺服器冷啟動需約 30 秒）');
      clearUrlParams();
    }, 15000);
  };

  const handleLeave = () => {
    socket.disconnect();
    setRoomData(null);
    setMyColor(null);
    setError('');
    clearUrlParams();
    socket.connect();
  };

  const handlePickColor = (color) => socket.emit('pick-color', { color });
  const handleToggleCell = (rowIndex, colIndex) => socket.emit('toggle-cell', { rowIndex, colIndex });
  const handleReset = () => socket.emit('reset-table');

  if (loading) {
    return <div className="loading">連線中...</div>;
  }

  if (!roomData) {
    return <LandingPage onJoin={handleJoin} error={error} joining={joining} />;
  }

  return (
    <GameRoom
      roomData={roomData}
      myColor={myColor}
      mySocketId={socket.id}
      onPickColor={handlePickColor}
      onToggleCell={handleToggleCell}
      onReset={handleReset}
      onLeave={handleLeave}
      error={error}
    />
  );
}

export default App;
