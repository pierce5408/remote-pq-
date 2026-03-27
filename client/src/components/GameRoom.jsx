const COLORS = ['red', 'blue', 'green', 'yellow'];

const COLOR_STYLES = {
  red:    { bg: '#E74C3C', label: '紅色' },
  blue:   { bg: '#3498DB', label: '藍色' },
  green:  { bg: '#2ECC71', label: '綠色' },
  yellow: { bg: '#F1C40F', label: '黃色' },
};

export default function GameRoom({ roomData, myColor, mySocketId, onPickColor, onToggleCell, onReset, onLeave, error }) {
  const { roomId, players, table } = roomData;

  const playerCount = Object.keys(players).length;

  const getColorOwner = (color) => {
    const entry = Object.entries(players).find(([, p]) => p.color === color);
    return entry ? entry[0] : null;
  };

  const takenByOther = (color) => {
    const owner = getColorOwner(color);
    return owner && owner !== mySocketId;
  };

  return (
    <div className="room-page">
    <div className="room-card room">
      <header className="room-header">
        <div className="header-left">
          <button className="btn-back" onClick={onLeave} title="返回">&#8592;</button>
          <h2>房間 #{roomId}</h2>
        </div>
        <span className="player-count">{playerCount} / 4 人</span>
      </header>

      {/* Color Picker */}
      <section className="color-section">
        <h3>{myColor ? '你的顏色' : '選擇你的顏色'}</h3>
        <div className="color-grid">
          {COLORS.map(color => {
            const style = COLOR_STYLES[color];
            const isMe = getColorOwner(color) === mySocketId;
            const isTaken = takenByOther(color);
            const isDisabled = isTaken;

            return (
              <button
                key={color}
                className={`color-block ${isMe ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                style={{ '--color-bg': style.bg }}
                onClick={() => !isDisabled && onPickColor(color)}
                disabled={isDisabled}
              >
                <span className="color-label">{style.label}</span>
                {isMe && <span className="badge">你</span>}
                {isTaken && <span className="badge taken-badge">佔用</span>}
              </button>
            );
          })}
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      {/* Selection Summary - only show my own path */}
      {myColor && (() => {
        const style = COLOR_STYLES[myColor];
        const path = [];
        table.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            if (cell === myColor) path.push({ box: ri + 1, pos: ci + 1 });
          });
        });
        path.sort((a, b) => a.box - b.box);

        return (
          <section className="summary-section">
            <h3>我的路徑</h3>
            <div className="summary-item">
              <span className="summary-dot" style={{ background: style.bg }} />
              <span className="summary-text">
                {path.length > 0
                  ? (() => {
                      const nums = path.map(p => p.pos);
                      const first = nums.slice(0, 5).join(' ');
                      const second = nums.slice(5).join(' ');
                      return second ? `${first} - ${second}` : first;
                    })()
                  : '尚未選擇'}
              </span>
            </div>
          </section>
        );
      })()}

      {/* 10x4 Table */}
      <section className="table-section">
        <div className="table-header">
          <h3>跳箱規劃表</h3>
          <button className="btn-reset" onClick={onReset}>重置</button>
        </div>
        {!myColor && <p className="hint">選擇顏色後才能點選格子</p>}
        <div className="table-wrapper">
          <table className="jump-table">
            <thead>
              <tr>
                <th className="row-num-header">箱子</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
              </tr>
            </thead>
            <tbody>
              {[...table].reverse().map((row, displayIndex) => {
                const rowIndex = table.length - 1 - displayIndex;
                return (
                  <tr key={rowIndex}>
                    <td className="row-num">{rowIndex + 1}</td>
                    {row.map((cellColor, colIndex) => {
                      const ismine = cellColor === myColor;
                      const isSomeoneElse = cellColor && !ismine;
                      const clickable = !!myColor && !isSomeoneElse;
                      const bgColor = cellColor ? COLOR_STYLES[cellColor]?.bg : null;

                      return (
                        <td
                          key={colIndex}
                          className={`cell ${clickable ? 'clickable' : ''} ${cellColor ? 'filled' : ''}`}
                          style={bgColor ? { background: bgColor } : {}}
                          onClick={() => clickable && onToggleCell(rowIndex, colIndex)}
                        >
                          <span className="cell-num" style={{ color: cellColor ? '#fff' : '#555' }}>
                            {colIndex + 1}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </div>
  );
}
