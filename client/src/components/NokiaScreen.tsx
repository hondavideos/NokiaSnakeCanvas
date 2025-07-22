import React, { useRef, useEffect, useState } from 'react';
import SnakeGame from './SnakeGame';
import { cn } from '../lib/utils';

const NokiaScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight
        });
        
        console.log('🔍 Nokia screen container dimensions:', offsetWidth, 'x', offsetHeight);
        console.log('🔍 Expected grid: 28×16 pixels');
        console.log('🔍 Container aspect ratio:', (offsetWidth / offsetHeight).toFixed(3), '(expected: 1.75 for 7:4)');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Add keyboard shortcut for debug mode (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        setShowDebug(prev => !prev);
        
        // Apply debug class to the game canvas when debug mode is toggled
        const gameCanvas = document.querySelector('.game-canvas');
        if (gameCanvas) {
          gameCanvas.classList.toggle('debug-overlay');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="nokia-phone-container">
      {/* Screen container that holds the game */}
      <div 
        ref={containerRef}
        className={cn(
          "nokia-screen-container", 
          showDebug && "debug-overlay"
        )}
      >
        <SnakeGame 
          canvasWidth={28} 
          canvasHeight={16} 
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          showDebug={showDebug}
        />
        
        {showDebug && (
          <div className="debug-info">
            <p>Screen: {dimensions.width}×{dimensions.height}px</p>
            <p>Game Grid: 28×16px</p>
            <p>Press Ctrl+Shift+D to toggle debug</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NokiaScreen;
