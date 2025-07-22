import { useState, useEffect } from 'react';
import NokiaScreen from './components/NokiaScreen';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time to ensure assets are ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {loading ? (
        <div className="loading">
          <p>Loading Snake Game...</p>
        </div>
      ) : (
        <div className="phone-container" style={{
          background: `url('/images/nokia-frame.png') center/contain no-repeat`,
          position: 'relative',
          width: '800px',
          height: '600px',
          pointerEvents: 'none', // Per requirements
        }}>
          {/* Game viewport with exact positioning */}
          <div className="game-canvas" style={{
            position: 'absolute',
            top: '39.8%',      // Moved down 10% per request
            left: '50.05%',    // Horizontal center
            transform: 'translate(-50%, -50%)',
            width: '19.5%',    // Reduced by 30% (27.5% * 0.7 = 19.25%, rounded to 19.5%)
            aspectRatio: '7/4', // Nokia 3310 screen aspect ratio (84x48)
            overflow: 'hidden',
            pointerEvents: 'auto', // Enable interaction within the game area
          }}>
            <NokiaScreen />
            
            {/* Optional alignment markers - will be visible in debug mode */}
            <div className="alignment-markers"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
