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
        <div className="nokia-container" style={{
          background: `url('/images/nokia-frame.png') center/contain no-repeat`,
          position: 'relative',
          width: '800px',
          height: '800px',
          pointerEvents: 'none', // Per requirements
        }}>
          {/* Game viewport with exact positioning */}
          <div className="game-viewport" style={{
            position: 'absolute',
            top: '23.5%',     // Vertical position - adjusted to match the phone's screen
            left: '50%',      // Horizontal center
            transform: 'translate(-50%, -50%)',
            width: '58%',     // Screen width
            height: '27%',    // Screen height - adjusted to maintain aspect ratio
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
