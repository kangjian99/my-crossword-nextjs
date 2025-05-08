import React from 'react';

function UsedWords({ words }) {
  return (
    <div>
      <h3>已使用的单词：</h3>
      <p>{words.join(', ')}</p>
    </div>
  );
}

export default UsedWords; 