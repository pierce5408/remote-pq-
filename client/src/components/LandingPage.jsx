import { useState } from 'react';

export default function LandingPage({ onJoin, error }) {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim() || !password.trim()) return;
    onJoin(roomId.trim(), password.trim());
  };

  return (
    <div className="landing">
      <div className="landing-card">
        <h1>Romeo & Juliet PQ</h1>
        <p className="subtitle">Artale 跳箱協調工具</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>房間號碼</label>
            <input
              type="text"
              placeholder="輸入房間號碼"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="field">
            <label>密碼</label>
            <input
              type="password"
              placeholder="輸入密碼"
              value={password}
              onChange={e => setPassword(e.target.value)}
              maxLength={30}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn-primary">加入 / 建立房間</button>
        </form>
      </div>
    </div>
  );
}
