import React from 'react';

interface ToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ value, onToggle }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onToggle(e.target.checked)}
        style={{ marginRight: '8px' }}
      />
      <span>{value ? 'Dark Mode' : 'Light Mode'}</span>
    </label>
  );
};
