import React, { useRef, useEffect, useState } from 'react';
import { useSnakeGame } from '../lib/stores/useSnakeGame';
import { useAudio } from '../lib/stores/useAudio';

interface SnakeGameProps {
  canvasWidth: number;
  canvasHeight: number;
  renderScale: number;
  showDebug?: boolean;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ 
  canvasWidth, 
  canvasHeight, 
  renderScale,
  showDebug = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [initialTouch, setInitialTouch] = useState<{ x: number, y: number } | null>(null);
  
  // Get snake game state and methods from our store
  const {
    snake,
    food,
    direction,
    score,
    gameOver,
    isPaused,
    setDirection,
    startGame,
    resetGame,
    togglePause
  } = useSnakeGame();
  
  // Audio initialization
  const { hitSound, setHitSound, playHit, toggleMute, isMuted } = useAudio();
  
  // Initialize sounds and game elements
  useEffect(() => {
    if (!hitSound) {
      // For collecting food
      const newHitSound = new Audio();
      newHitSound.src = '/sounds/hit.mp3';
      newHitSound.volume = 0.3;
      setHitSound(newHitSound);
    }
    
    // Detect if we're on a touch device
    const detectTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    detectTouch();
    
    // Make sure we have food on the screen even before the game starts
    // This ensures there's always food visible
    if (food.x === 0 && food.y === 0) {
      const { generateFood } = useSnakeGame.getState();
      generateFood();
    }
  }, [hitSound, setHitSound, food]);

  // Set up the rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Pixel-art rendering setup
    ctx.imageSmoothingEnabled = false;
    
    const CELL_SIZE = 1; // Normalized cell size for both snake and food
    const pixelSize = CELL_SIZE; // Size of a single game pixel
    
    // Clear the canvas
    const clearCanvas = () => {
      ctx.fillStyle = '#c7f0d8'; // Nokia LCD background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    // Draw the snake
    const drawSnake = () => {
      ctx.fillStyle = '#32383e'; // Nokia LCD foreground color
      
      // Make sure we're using integers for positioning to avoid gaps
      snake.forEach(segment => {
        // Make sure the segment is within the visible bounds
        const x = Math.floor(segment.x);
        const y = Math.floor(segment.y);
        
        // Use strict bounds checking for rendering
        if (x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
          ctx.fillRect(
            x * CELL_SIZE * renderScale, 
            y * CELL_SIZE * renderScale, 
            CELL_SIZE * renderScale, 
            CELL_SIZE * renderScale
          );
        }
      });
    };
    
    // Draw the food - same size as snake segments
    const drawFood = () => {
      // Calculate pixel coordinates using CELL_SIZE
      const foodPixelX = food.x * CELL_SIZE * renderScale;
      const foodPixelY = food.y * CELL_SIZE * renderScale;
      const cellSize = CELL_SIZE * renderScale; // Same size as snake segments
      
      // Draw solid black square (same size as snake)
      ctx.fillStyle = '#000000';
      ctx.fillRect(foodPixelX, foodPixelY, cellSize, cellSize);
      
      // Draw white border for contrast
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(foodPixelX, foodPixelY, cellSize, cellSize);
      
      console.log("Drawing food at position:", food.x, food.y);
    };
    
    // Draw score
    const drawScore = () => {
      ctx.fillStyle = '#32383e'; // Nokia LCD foreground color
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`${score}`, renderScale * 2, renderScale * 5);
    };
    
    // Draw game over message
    const drawGameOver = () => {
      ctx.fillStyle = '#32383e';
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'GAME OVER', 
        canvas.width / 2, 
        canvas.height / 2 - renderScale * 2
      );
      ctx.fillText(
        `SCORE: ${score}`, 
        canvas.width / 2, 
        canvas.height / 2 + renderScale * 3
      );
      ctx.font = `${Math.floor(renderScale * 2)}px monospace`;
      ctx.fillText(
        'PRESS SPACE', 
        canvas.width / 2, 
        canvas.height / 2 + renderScale * 8
      );
    };
    
    // Draw paused message
    const drawPaused = () => {
      ctx.fillStyle = '#32383e';
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'PAUSED', 
        canvas.width / 2, 
        canvas.height / 2
      );
    };
    
    // Draw start screen
    const drawStartScreen = () => {
      ctx.fillStyle = '#32383e';
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'SNAKE', 
        canvas.width / 2, 
        canvas.height / 2 - renderScale * 5
      );
      
      // Draw a small snake
      ctx.fillRect(canvas.width / 2 - renderScale * 6, canvas.height / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(canvas.width / 2 - renderScale * 3, canvas.height / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(canvas.width / 2, canvas.height / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(canvas.width / 2 + renderScale * 3, canvas.height / 2, renderScale * 3, renderScale * 3);
      
      ctx.font = `${Math.floor(renderScale * 2)}px monospace`;
      ctx.fillText(
        'PRESS SPACE', 
        canvas.width / 2, 
        canvas.height / 2 + renderScale * 8
      );
      
      if (isTouchDevice) {
        ctx.fillText(
          'OR TAP SCREEN', 
          canvas.width / 2, 
          canvas.height / 2 + renderScale * 12
        );
      }
      
      // Sound status
      const soundStatus = isMuted ? "SOUND: OFF" : "SOUND: ON";
      ctx.font = `${Math.floor(renderScale * 1.5)}px monospace`;
      ctx.fillText(
        soundStatus, 
        canvas.width / 2, 
        canvas.height - renderScale * 3
      );
    };
    
    // Draw debug grid if enabled
    const drawDebugGrid = () => {
      if (!showDebug) return;
      
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= canvasWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * renderScale, 0);
        ctx.lineTo(x * renderScale, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvasHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * renderScale);
        ctx.lineTo(canvas.width, y * renderScale);
        ctx.stroke();
      }
    };
    
    // Draw the current state
    const draw = () => {
      clearCanvas();
      
      if (snake.length === 0) {
        // Show start screen
        drawStartScreen();
        
        // Always show food on start screen for visibility
        drawFood();
      } else if (gameOver) {
        // Game over screen
        drawSnake();
        drawFood();
        drawScore();
        drawGameOver();
      } else if (isPaused) {
        // Paused screen
        drawSnake();
        drawFood();
        drawScore();
        drawPaused();
      } else {
        // Active game
        drawSnake();
        drawFood();
        drawScore();
      }
      
      drawDebugGrid();
    };
    
    // Render loop
    draw();
    
    // Cleanup
    return () => {
      // Any cleanup if needed
    };
  }, [
    canvasWidth,
    canvasHeight,
    renderScale,
    snake,
    food,
    score,
    gameOver,
    isPaused,
    showDebug,
    isTouchDevice,
    isMuted
  ]);
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (direction !== 'down') setDirection('up');
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (direction !== 'up') setDirection('down');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (direction !== 'right') setDirection('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (direction !== 'left') setDirection('right');
          break;
        case 'Space':
          if (gameOver) {
            resetGame();
          } else if (snake.length === 0) {
            startGame();
          } else {
            togglePause();
          }
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, gameOver, snake.length, resetGame, setDirection, startGame, togglePause, toggleMute]);
  
  // Handle touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (snake.length === 0) {
      startGame();
      return;
    }
    
    if (gameOver) {
      resetGame();
      return;
    }
    
    const touch = e.touches[0];
    setInitialTouch({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (initialTouch === null || isPaused || gameOver) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - initialTouch.x;
    const deltaY = touch.clientY - initialTouch.y;
    
    // Determine the direction based on the larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 20 && direction !== 'left') {
        setDirection('right');
        setInitialTouch({ x: touch.clientX, y: touch.clientY });
      } else if (deltaX < -20 && direction !== 'right') {
        setDirection('left');
        setInitialTouch({ x: touch.clientX, y: touch.clientY });
      }
    } else {
      if (deltaY > 20 && direction !== 'up') {
        setDirection('down');
        setInitialTouch({ x: touch.clientX, y: touch.clientY });
      } else if (deltaY < -20 && direction !== 'down') {
        setDirection('up');
        setInitialTouch({ x: touch.clientX, y: touch.clientY });
      }
    }
  };
  
  const handleTouchEnd = () => {
    setInitialTouch(null);
  };
  
  // Double tap to pause
  const handleDoubleTap = () => {
    if (!gameOver && snake.length > 0) {
      togglePause();
    }
  };
  
  return (
    <div className="snake-game-container">
      <canvas 
        ref={canvasRef}
        width={canvasWidth * renderScale}
        height={canvasHeight * renderScale}
        className="snake-game-canvas"
        style={{ 
          maxWidth: '672px', 
          maxHeight: '384px',
          transform: 'scale(0.82)',
          transformOrigin: 'top left',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      />
      
      {isTouchDevice && (
        <div className="touch-controls">
          <button className="touch-control up" onTouchStart={() => direction !== 'down' && setDirection('up')}>↑</button>
          <div className="touch-controls-middle">
            <button className="touch-control left" onTouchStart={() => direction !== 'right' && setDirection('left')}>←</button>
            <button className="touch-control right" onTouchStart={() => direction !== 'left' && setDirection('right')}>→</button>
          </div>
          <button className="touch-control down" onTouchStart={() => direction !== 'up' && setDirection('down')}>↓</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
