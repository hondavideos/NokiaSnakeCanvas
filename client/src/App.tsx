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
          {/* Game viewport with exact positioning to match Nokia phone screen */}
          <div className="game-canvas" style={{
            position: 'absolute',
            top: '40.8%',      // Fine-tuned to ensure full Nokia screen coverage
            left: '50%',       // Perfect horizontal center
            transform: 'translate(-50%, -50%)',
            width: '19.2%',    // Increased to fully cover Nokia screen and eliminate black borders
            aspectRatio: '7/4', // Nokia 3310 screen aspect ratio (84x48)
            overflow: 'hidden',
            pointerEvents: 'auto', // Enable interaction within the game area
            borderRadius: '4px', // Subtle curve to match Nokia screen curvature
            filter: 'brightness(0.95)', // Slight dimming for more authentic CRT look
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
