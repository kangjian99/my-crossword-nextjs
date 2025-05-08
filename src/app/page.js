'use client';

import React, { useState } from 'react';
import WordInput from '@/components/WordInput';
import GridSizeInput from '@/components/GridSizeInput';
import DifficultySelect from '@/components/DifficultySelect';
import CrosswordGrid from '@/components/CrosswordGrid';
import WordList from '@/components/WordList';
// import { generateCrossword } from './utils/crosswordGenerator'; // 移除生成逻辑的直接导入
import Login from '@/components/Login'; // 导入 Login 组件
// import './App.css'; // 样式将移动到全局 CSS

function HomePage() { // 将 App 函数重命名为 HomePage 以符合 Next.js 约定
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 新增登录状态
  const [words, setWords] = useState([]);
  const [gridSize, setGridSize] = useState(15);
  const [difficulty, setDifficulty] = useState('medium');
  const [crosswordGrid, setCrosswordGrid] = useState([]);
  const [usedWords, setUsedWords] = useState([]);

  const handleGenerateCrossword = async () => { // 修改为异步函数
    try {
      const response = await fetch('/api/generate-crossword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words, gridSize, difficulty }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCrosswordGrid(data.grid);
      setUsedWords(data.usedWords);
    } catch (error) {
      console.error('生成填字游戏失败:', error);
      // 可以在这里添加用户友好的错误提示
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    // 在 Next.js 中，你可能需要一个单独的登录页面或使用更高级的认证方案
    // 为了快速迁移，暂时保留这里的逻辑，但请注意这通常不是 Next.js 应用中处理认证的最佳方式。
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 如果已登录，显示应用主界面
  return (
    <div className="App"> {/* 保留 className 以兼容原 App.css 样式 */}
      <h2>填字游戏生成器</h2>
      <div className="app-container">
        <WordInput onWordsChange={setWords} />
        <GridSizeInput value={gridSize} onChange={setGridSize} />
        <DifficultySelect value={difficulty} onChange={setDifficulty} />
        <button onClick={handleGenerateCrossword}>生成填字游戏</button>
        <CrosswordGrid grid={crosswordGrid} />
        {crosswordGrid.length > 0 && (
          <button onClick={handleGenerateCrossword}>再次生成</button>
        )}
        {crosswordGrid.length > 0 && (
          <WordList usedWords={usedWords} allWords={words} />
        )}
      </div>
    </div>
  );
}

export default HomePage; 