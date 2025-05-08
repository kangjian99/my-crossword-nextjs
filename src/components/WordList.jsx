import React from 'react';

function WordList({ usedWords, allWords }) {
  const unusedWords = allWords.filter(word => 
    !usedWords.some(usedWord => usedWord.toLowerCase() === word.toLowerCase())
  );

  return (
    <div>
      <h3>已使用的单词：</h3>
      <p>{usedWords.map(word => word.toLowerCase()).join(', ')}</p>
      <h3>未使用的单词：</h3>
      <p>{unusedWords.map(word => word.toLowerCase()).join(', ')}</p>
    </div>
  );
}

export default WordList; 