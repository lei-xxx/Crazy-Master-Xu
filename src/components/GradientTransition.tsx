
import React from 'react';

const GradientTransition = () => {
  return (
    <div 
      className="relative" 
      style={{
        width: 'calc(100% + 2px)',
        height: '302px',
        background: 'linear-gradient(to bottom, #000000 0%, #0009ff 50%, #ffffff 100%)'
      }}
    />
  );
};

export default GradientTransition;
