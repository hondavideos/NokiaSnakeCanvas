import { create } from 'zustand';
import { useAudio } from './useAudio';

// Define types
type Direction = 'up' | 'down' | 'left' | 'right';
type Position = { x: number; y: number };

interface SnakeGameState {
  // Game state
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  speed: number;
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
  lastTick: number;
  gridWidth: number;
  gridHeight: number;
  
  // Methods
  setDirection: (direction: Direction) => void;
  startGame: () => void;
  resetGame: () => void;
  togglePause: () => void;
  moveSnake: () => void;
  generateFood: () => void;
  increaseSpeed: () => void;
}

export const useSnakeGame = create<SnakeGameState>((set, get) => ({
  // Initialize with empty snake (indicates game hasn't started)
  snake: [],
  food: { x: 0, y: 0 },
  direction: 'right',
  nextDirection: 'right',
  speed: 200, // ms between moves
  score: 0,
  highScore: 0,
  gameOver: false,
  isPaused: false,
  lastTick: 0,
  gridWidth: 28,
  gridHeight: 16,
  
  setDirection: (direction: Direction) => {
    // Prevent 180° turns
    const currentDirection = get().direction;
    
    if (
      (direction === 'up' && currentDirection === 'down') ||
      (direction === 'down' && currentDirection === 'up') ||
      (direction === 'left' && currentDirection === 'right') ||
      (direction === 'right' && currentDirection === 'left')
    ) {
      return; // Invalid direction change
    }
    
    set({ nextDirection: direction });
  },
  
  startGame: () => {
    // Initial snake position (middle of screen)
    const initialSnake = [
      { x: 14, y: 8 }, // Head
      { x: 13, y: 8 },
      { x: 12, y: 8 },
    ];
    
    // Generate initial food - at random position that's not on the snake
    const initialFood = generateRandomPosition(
      get().gridWidth,
      get().gridHeight,
      initialSnake
    );
    
    // Game start debug log removed for production
    
    // Set initial state and start the engine timing
    set({
      snake: initialSnake,
      food: initialFood,
      direction: 'right',
      nextDirection: 'right',
      speed: 200,
      score: 0,
      gameOver: false,
      isPaused: false,
      lastTick: performance.now(), // Initialize timing
    });
  },
  
  resetGame: () => {
    // Update high score if needed
    const currentScore = get().score;
    const currentHighScore = get().highScore;
    
    if (currentScore > currentHighScore) {
      set({ highScore: currentScore });
    }
    
    // Reset to start screen state
    set({
      snake: [],
      food: { x: 0, y: 0 },
      direction: 'right',
      nextDirection: 'right',
      speed: 200,
      score: 0,
      gameOver: false,
      isPaused: false,
      lastTick: 0,
    });
  },
  
  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },
  
  moveSnake: () => {
    const {
      snake,
      food,
      nextDirection,
      score,
      gridWidth,
      gridHeight
    } = get();
    
    // Use the nextDirection as the current direction for this move
    // (Direction will be updated in the batched state update below)
    
    // Calculate new head position with INSTANT wrapping using modulo
    const head = { ...snake[0] };
    
    // Move the head one step in the direction
    let dx = 0, dy = 0;
    switch (nextDirection) {
      case 'up':
        dy = -1;
        break;
      case 'down':
        dy = 1;
        break;
      case 'left':
        dx = -1;
        break;
      case 'right':
        dx = 1;
        break;
    }
    
    // Apply movement and instant wrapping with modulo arithmetic
    head.x = (head.x + dx + gridWidth) % gridWidth;
    head.y = (head.y + dy + gridHeight) % gridHeight;
    
    // Log the new head position for debugging
    // Snake movement debug log removed for production
    
    // Create new snake with new head
    const newSnake = [head, ...snake];
    
    // Check for collision with self using the new snake state
    for (let i = 1; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        set({ gameOver: true });
        return;
      }
    }
    
    // Check if food is eaten
    const foodEaten = head.x === food.x && head.y === food.y;
    
    if (foodEaten) {
      // Play sound
      const { playHit } = useAudio.getState();
      playHit();
      
      // Increase score
      const newScore = score + 1;
      
      // Generate new food position
      const newFood = generateRandomPosition(gridWidth, gridHeight, newSnake);
      
      // Progressive speed increase with every food eaten (Option A)
      let newSpeed = get().speed;
      newSpeed = Math.max(50, Math.floor(newSpeed * 0.98)); // 2% faster each food
      
      // Batch all state updates into a single call
      set({ 
        snake: newSnake, 
        score: newScore, 
        food: newFood,
        speed: newSpeed,
        direction: nextDirection
      });
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
      // Single state update for snake movement
      set({ snake: newSnake, direction: nextDirection });
    }
  },
  
  
  generateFood: () => {
    const { gridWidth, gridHeight, snake } = get();
    // Generate food at random position within grid bounds
    const newFood = generateRandomPosition(gridWidth, gridHeight, snake);
    // Food generation debug log removed for production
    set({ food: newFood });
  },
  
  increaseSpeed: () => {
    set(state => ({
      speed: Math.max(50, Math.floor(state.speed * 0.9))
    }));
  },
}));

// Game engine functionality moved to React component lifecycle
// This eliminates the global loop that runs continuously

// Helper function to generate random position for food
// that doesn't collide with the snake - optimized for performance
function generateRandomPosition(
  gridWidth: number,
  gridHeight: number,
  snake: Position[]
): Position {
  const totalCells = gridWidth * gridHeight;
  const occupiedCells = new Set(snake.map(segment => `${segment.x},${segment.y}`));
  
  // If snake is getting very long, use the free cells approach
  if (snake.length > totalCells * 0.5) {
    const freeCells: Position[] = [];
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        if (!occupiedCells.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }
    if (freeCells.length === 0) {
      // Game should be over - return current food position as fallback
      return { x: 0, y: 0 };
    }
    return freeCells[Math.floor(Math.random() * freeCells.length)];
  }
  
  // For shorter snakes, use the original random approach with better collision detection
  let attempts = 0;
  const maxAttempts = Math.min(100, totalCells - snake.length);
  
  do {
    const newPosition = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
    
    if (!occupiedCells.has(`${newPosition.x},${newPosition.y}`)) {
      return newPosition;
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  // Fallback: return first available position
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      if (!occupiedCells.has(`${x},${y}`)) {
        return { x, y };
      }
    }
  }
  
  // This should never happen unless the grid is completely full
  return { x: 0, y: 0 };
}
