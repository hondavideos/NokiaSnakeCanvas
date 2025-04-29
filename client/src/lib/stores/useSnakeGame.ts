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
  gameInterval: ReturnType<typeof setInterval> | null;
  gridWidth: number;
  gridHeight: number;
  
  // Methods
  setDirection: (direction: Direction) => void;
  startGame: () => void;
  resetGame: () => void;
  togglePause: () => void;
  moveSnake: () => void;
  checkCollision: () => boolean;
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
  gameInterval: null,
  gridWidth: 84,
  gridHeight: 48,
  
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
    // Clear any existing interval
    if (get().gameInterval) {
      clearInterval(get().gameInterval);
    }
    
    // Initial snake position (middle of screen)
    const initialSnake = [
      { x: 42, y: 24 }, // Head
      { x: 41, y: 24 },
      { x: 40, y: 24 },
    ];
    
    // Generate initial food - at random position that's not on the snake
    const initialFood = generateRandomPosition(
      get().gridWidth,
      get().gridHeight,
      initialSnake
    );
    
    console.log("Game started with food at:", initialFood);
    
    // Set initial state
    set({
      snake: initialSnake,
      food: initialFood,
      direction: 'right',
      nextDirection: 'right',
      speed: 200,
      score: 0,
      gameOver: false,
      isPaused: false,
    });
    
    // Start game loop
    const gameInterval = setInterval(() => {
      if (!get().isPaused && !get().gameOver) {
        get().moveSnake();
      }
    }, get().speed);
    
    set({ gameInterval });
  },
  
  resetGame: () => {
    // Clear the interval
    if (get().gameInterval) {
      clearInterval(get().gameInterval);
    }
    
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
      gameInterval: null,
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
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (nextDirection) {
      case 'up':
        head.y = (head.y - 1 + gridHeight) % gridHeight;
        break;
      case 'down':
        head.y = (head.y + 1) % gridHeight;
        break;
      case 'left':
        head.x = (head.x - 1 + gridWidth) % gridWidth;
        break;
      case 'right':
        head.x = (head.x + 1) % gridWidth;
        break;
    }
    
    // Check for collision with self
    if (get().checkCollision()) {
      set({ gameOver: true });
      return;
    }
    
    // Create new snake with new head
    const newSnake = [head, ...snake];
    
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
  
  checkCollision: () => {
    const { snake } = get();
    const head = snake[0];
    
    // Check collision with self (skip the head)
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    
    return false;
  },
  
  generateFood: () => {
    const { gridWidth, gridHeight, snake } = get();
    // Make sure we have a valid snake before generating food
    if (snake.length > 0) {
      const newFood = generateRandomPosition(gridWidth, gridHeight, snake);
      console.log("Generated new food at:", newFood);
      set({ food: newFood });
    } else {
      // If no snake (game not started), place food at a default position
      const defaultFood = { x: 60, y: 24 };
      console.log("Set default food at:", defaultFood);
      set({ food: defaultFood });
    }
  },
  
  increaseSpeed: () => {
    const { speed, gameInterval } = get();
    
    if (speed > 50) {
      // Clear existing interval
      if (gameInterval) {
        clearInterval(gameInterval);
      }
      
      // Calculate new speed (10% faster)
      const newSpeed = Math.max(50, Math.floor(speed * 0.9));
      
      // Start new interval with increased speed
      const newInterval = setInterval(() => {
        if (!get().isPaused && !get().gameOver) {
          get().moveSnake();
        }
      }, newSpeed);
      
      set({
        speed: newSpeed,
        gameInterval: newInterval,
      });
    }
  },
}));

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
