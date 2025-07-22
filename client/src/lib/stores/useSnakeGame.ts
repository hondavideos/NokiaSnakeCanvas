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
    
    console.log("Game started with food at:", initialFood);
    
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
    set({ direction: nextDirection });
    
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
    console.log("New head position:", head.x, head.y);
    
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
      
      // Generate new food
      get().generateFood();
      
      // Increase speed every 5 points
      if (newScore % 5 === 0) {
        get().increaseSpeed();
      }
      
      set({ score: newScore });
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
    }
    
    set({ snake: newSnake });
  },
  
  
  generateFood: () => {
    const { gridWidth, gridHeight, snake } = get();
    // Generate food at random position within grid bounds
    const newFood = generateRandomPosition(gridWidth, gridHeight, snake);
    console.log("Generated new food at:", newFood);
    set({ food: newFood });
  },
  
  increaseSpeed: () => {
    set(state => ({
      speed: Math.max(50, Math.floor(state.speed * 0.9))
    }));
  },
}));

// Start the game engine loop
const engine = () => {
  const { lastTick, speed, isPaused, gameOver, moveSnake } = useSnakeGame.getState();
  const now = performance.now();
  
  if (!isPaused && !gameOver && now - lastTick >= speed) {
    moveSnake();
    useSnakeGame.setState({ lastTick: now });
  }
  
  requestAnimationFrame(engine);
};

// Start the engine
requestAnimationFrame(engine);

// Helper function to generate random position for food
// that doesn't collide with the snake
function generateRandomPosition(
  gridWidth: number,
  gridHeight: number,
  snake: Position[]
): Position {
  let newPosition: Position;
  let collision: boolean;
  
  do {
    collision = false;
    newPosition = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
    
    // Check if new position collides with any part of the snake
    for (const segment of snake) {
      if (segment.x === newPosition.x && segment.y === newPosition.y) {
        collision = true;
        break;
      }
    }
  } while (collision);
  
  return newPosition;
}
