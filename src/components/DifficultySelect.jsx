import React from 'react';

function DifficultySelect({ value, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="input-group">
      <label>难度：</label>
      <select value={value} onChange={handleChange}>
        <option value="easy">低</option>
        <option value="medium">中</option>
        <option value="hard">高</option>
      </select>
    </div>
  );
}

export default DifficultySelect; 