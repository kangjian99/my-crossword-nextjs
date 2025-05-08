import React from 'react';

function GridSizeInput({ value, onChange }) {
  const handleChange = (e) => {
    onChange(parseInt(e.target.value, 10));
  };

  return (
    <div className="input-group">
      <label>网格尺寸：</label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={5}
        max={20}
        placeholder="网格大小"
      />
    </div>
  );
}

export default GridSizeInput; 