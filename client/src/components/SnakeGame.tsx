import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSnakeGame } from '../lib/stores/useSnakeGame';
import { useAudio } from '../lib/stores/useAudio';

// Custom hook to manage game engine lifecycle
const useGameEngine = () => {
  const engineRef = useRef<number | null>(null);
  
  const startEngine = useCallback(() => {
    if (engineRef.current) return;
    
    const engine = () => {
      const { lastTick, speed, isPaused, gameOver, moveSnake } = useSnakeGame.getState();
      const now = performance.now();
      
      if (!isPaused && !gameOver && now - lastTick >= speed) {
        moveSnake();
        useSnakeGame.setState({ lastTick: now });
      }
      
      engineRef.current = requestAnimationFrame(engine);
    };
    
    engineRef.current = requestAnimationFrame(engine);
  }, []);
  
  const stopEngine = useCallback(() => {
    if (engineRef.current) {
      cancelAnimationFrame(engineRef.current);
      engineRef.current = null;
    }
  }, []);
  
  return { startEngine, stopEngine };
};

interface SnakeGameProps {
  canvasWidth: number;
  canvasHeight: number;
  containerWidth: number;
  containerHeight: number;
  showDebug?: boolean;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ 
  canvasWidth, 
  canvasHeight, 
  containerWidth,
  containerHeight,
  showDebug = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [initialTouch, setInitialTouch] = useState<{ x: number, y: number } | null>(null);
  
  // Target native Nokia 3310 screen size: 672×384px (28×16 at 24px per cell)
  const targetCanvasWidth = 672;  // 28 * 24
  const targetCanvasHeight = 384; // 16 * 24
  
  // Calculate renderScale to achieve target size with integer scaling
  const renderScale = Math.floor(Math.min(
    targetCanvasWidth / canvasWidth,
    targetCanvasHeight / canvasHeight
  ));
  
  // Calculate actual canvas dimensions (targeting 672×384)
  const actualCanvasWidth = canvasWidth * renderScale;
  const actualCanvasHeight = canvasHeight * renderScale;
  
  // Get snake game state with selective subscriptions for optimal performance
  const snake = useSnakeGame(state => state.snake);
  const food = useSnakeGame(state => state.food);
  const direction = useSnakeGame(state => state.direction);
  const score = useSnakeGame(state => state.score);
  const gameOver = useSnakeGame(state => state.gameOver);
  const isPaused = useSnakeGame(state => state.isPaused);
  
  // Get stable method references (these don't change)
  const setDirection = useSnakeGame(state => state.setDirection);
  const startGame = useSnakeGame(state => state.startGame);
  const resetGame = useSnakeGame(state => state.resetGame);
  const togglePause = useSnakeGame(state => state.togglePause);
  
  // Audio initialization with selective subscriptions
  const hitSound = useAudio(state => state.hitSound);
  const isMuted = useAudio(state => state.isMuted);
  const setHitSound = useAudio(state => state.setHitSound);
  const playHit = useAudio(state => state.playHit);
  const toggleMute = useAudio(state => state.toggleMute);
  const cleanup = useAudio(state => state.cleanup);
  
  // Game engine management
  const { startEngine, stopEngine } = useGameEngine();
  
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
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    
    detectTouch();
    
    // Make sure we have food on the screen even before the game starts
    // This ensures there's always food visible
    if (food.x === 0 && food.y === 0) {
      const { generateFood } = useSnakeGame.getState();
      generateFood();
    }
  }, [hitSound, setHitSound, food]);

  // Game engine lifecycle management
  useEffect(() => {
    startEngine();
    
    return () => {
      stopEngine();
    };
  }, [startEngine, stopEngine]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Canvas setup - only runs when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions to match calculated size
    canvas.width = actualCanvasWidth;
    canvas.height = actualCanvasHeight;
    
    // Canvas setup complete - removed debug logs for production
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Pixel-art rendering setup
    ctx.imageSmoothingEnabled = false;
  }, [actualCanvasWidth, actualCanvasHeight]); // Only re-run when dimensions change

  // Rendering logic - separate from canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
        const x = Math.floor(segment.x);
        const y = Math.floor(segment.y);
        
        // Render all segments (wrap-around logic ensures they're always in bounds)
        ctx.fillRect(
          x * CELL_SIZE * renderScale, 
          y * CELL_SIZE * renderScale, 
          CELL_SIZE * renderScale, 
          CELL_SIZE * renderScale
        );
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
      
      // Food position debug log removed for production
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
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2 - renderScale * 2
      );
      ctx.fillText(
        `SCORE: ${score}`, 
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2 + renderScale * 3
      );
      ctx.font = `${Math.floor(renderScale * 2)}px monospace`;
      ctx.fillText(
        'PRESS SPACE', 
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2 + renderScale * 8
      );
    };
    
    // Draw paused message
    const drawPaused = () => {
      ctx.fillStyle = '#32383e';
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'PAUSED', 
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2
      );
    };
    
    // Draw start screen
    const drawStartScreen = () => {
      ctx.fillStyle = '#32383e';
      ctx.font = `${Math.floor(renderScale * 3)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(
        'SNAKE', 
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2 - renderScale * 5
      );
      
      // Draw a small snake
      ctx.fillRect(actualCanvasWidth / 2 - renderScale * 6, actualCanvasHeight / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(actualCanvasWidth / 2 - renderScale * 3, actualCanvasHeight / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(actualCanvasWidth / 2, actualCanvasHeight / 2, renderScale * 3, renderScale * 3);
      ctx.fillRect(actualCanvasWidth / 2 + renderScale * 3, actualCanvasHeight / 2, renderScale * 3, renderScale * 3);
      
      ctx.font = `${Math.floor(renderScale * 2)}px monospace`;
      ctx.fillText(
        'PRESS SPACE', 
        actualCanvasWidth / 2, 
        actualCanvasHeight / 2 + renderScale * 8
      );
      
      if (isTouchDevice) {
        ctx.fillText(
          'OR TAP SCREEN', 
          actualCanvasWidth / 2, 
          actualCanvasHeight / 2 + renderScale * 12
        );
      }
      
      // Sound status with M key indicator
      const soundStatus = isMuted ? "SOUND: OFF (M)" : "SOUND: ON (M)";
      ctx.font = `${Math.floor(renderScale * 1.5)}px monospace`;
      ctx.fillText(
        soundStatus, 
        actualCanvasWidth / 2, 
        actualCanvasHeight - renderScale * 3
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
        ctx.lineTo(x * renderScale, actualCanvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvasHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * renderScale);
        ctx.lineTo(actualCanvasWidth, y * renderScale);
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
  }, [snake, food, score, gameOver, isPaused, showDebug]); // Only re-render when game state changes
  
  // Stable keyboard handler with useCallback
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentState = useSnakeGame.getState();
    const { direction, gameOver, snake } = currentState;
    
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
  }, [setDirection, startGame, resetGame, togglePause, toggleMute]);

  // Handle keyboard controls - only re-register when handler changes
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
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
        className="snake-game-canvas"
        style={{ 
          width: 'auto',
          height: 'auto',
          display: 'block',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      />
      
      {isTouchDevice && (
        <div className="touch-controls">
          <button
            className="touch-control up"
            onTouchStart={() => {
              if (snake.length === 0) startGame();
              else if (gameOver) resetGame();
              if (direction !== 'down') setDirection('up');
            }}
          >
            ↑
          </button>
          <div className="touch-controls-middle">
            <button
              className="touch-control left"
              onTouchStart={() => {
                if (snake.length === 0) startGame();
                else if (gameOver) resetGame();
                if (direction !== 'right') setDirection('left');
              }}
            >
              ←
            </button>
            <button
              className="touch-control right"
              onTouchStart={() => {
                if (snake.length === 0) startGame();
                else if (gameOver) resetGame();
                if (direction !== 'left') setDirection('right');
              }}
            >
              →
            </button>
          </div>
          <button
            className="touch-control down"
            onTouchStart={() => {
              if (snake.length === 0) startGame();
              else if (gameOver) resetGame();
              if (direction !== 'up') setDirection('down');
            }}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
