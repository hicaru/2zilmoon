import React from 'react';

interface ModalProps {
  show: boolean;
  title: React.ReactNode;
  width?: string;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ show, title, width, onClose, children }) => {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: width || 'auto', position: 'relative' }}>
        {title}
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}>&times;</button>
        {children}
      </div>
    </div>
  );
};

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, children }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <h2>{children}</h2>
    </div>
  );
};
