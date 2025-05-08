import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './CrosswordGrid.css';

function CrosswordGrid({ grid }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (grid.length) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [grid]);

  if (!grid.length) return null;

  const saveAsImage = () => {
    if (cardRef.current) {
      html2canvas(cardRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = '填字游戏.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const calculateFontSize = (gridSize) => {
    if (gridSize <= 10) {
      return 22;
    } else if (gridSize === 11) {
      return 24;
    } else {
      // 对于更大的网格，逐渐减小字体大小
      return Math.max(26 - (gridSize - 12), 18); // 最小字体大小为18px
    }
  };

  return (
    <div className="crossword-container">
      <div className="crossword-card" ref={cardRef}>
        <h2 
          className="crossword-title"
          style={{ fontSize: `${calculateFontSize(grid.length)}px` }}
        >
          初中英语阅读理解重点单词<br />
          填字游戏记忆卡
        </h2>
        <div 
          className="crossword-grid"
          style={{ gridTemplateColumns: `repeat(${grid.length}, 30px)` }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell ${cell === '' ? 'black' : ''} ${cell === ' ' ? 'empty' : ''}`}
                contentEditable={cell === ' '}
              >
                {cell === ' ' ? null : cell}
              </div>
            ))
          )}
        </div>
      </div>
      <button onClick={saveAsImage} className="green-button">保存为图片</button>
    </div>
  );
}

export default CrosswordGrid; 