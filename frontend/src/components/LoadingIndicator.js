import React from 'react';

function LoadingIndicator() {
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#1a1a1a',
  };

  return (
    <div style={style}>
      {/* Optional: Add text or an icon here if you want */}
    </div>
  );
}

export default LoadingIndicator;
