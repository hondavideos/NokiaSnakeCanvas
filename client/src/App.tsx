import { useState, useEffect } from 'react';
import NokiaScreen from './components/NokiaScreen';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  // ====== BACKGROUND VERSION SWITCHING ======
  // Change this flag to switch between backgrounds:
  // true  = New forest-covered Nokia background
  // false = Original plain Nokia frame
  const useForestBackground = true;
  
  // Background image paths
  const backgroundImages = {
    original: '/images/nokia-frame.png',     // Original working version
    forest: '/images/nokia-forest.png'      // New forest-themed version
  };

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
          background: `url('${useForestBackground ? backgroundImages.forest : backgroundImages.original}') center/contain no-repeat`,
          position: 'relative',
          width: '1360px', // 800px * 1.7 = 1360px (170% scale for better visibility)
          height: '1020px', // 600px * 1.7 = 1020px (170% scale for better visibility)
          pointerEvents: 'none', // Per requirements
        }}>
          {/* Game viewport with exact positioning to match Nokia phone screen */}
          <div className="game-canvas" style={{
            position: 'absolute',
            top: 'calc(40.8% - 10px)', // Moved down 10px from previous position
            left: '50%',       // Perfect horizontal center
            transform: 'translate(-50%, -50%)',
            width: '17.5%',    // Reverted to proper width that doesn't overlay the sides
            height: '15.84%',  // Additional 20% height increase (13.2% * 1.2) for full coverage
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

/* 
====== ROLLBACK INSTRUCTIONS ======

TO SWITCH BACK TO ORIGINAL BACKGROUND:
1. Change line 12: const useForestBackground = false;
2. Save the file - that's it!

CURRENT WORKING GAME SCREEN POSITIONING:
- top: 'calc(40.8% - 10px)'     // Perfect vertical alignment
- left: '50%'                   // Perfect horizontal center  
- width: '17.5%'                // Optimal width without overlapping sides
- height: '15.84%'              // Full coverage without black bars
- transform: 'translate(-50%, -50%)'  // Perfect centering
- Phone container: 1360px × 1020px (170% scale)

These values were fine-tuned through multiple iterations and work perfectly.
If the forest background requires different positioning, adjust the values above 
but keep these original values commented for easy rollback.

BACKGROUND FILES:
- Original: /images/nokia-frame.png (preserved)  
- Forest: /images/nokia-forest.png (new)
*/

export default App;
