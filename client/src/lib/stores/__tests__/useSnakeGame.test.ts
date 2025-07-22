import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSnakeGame } from '../useSnakeGame';

// Mock the audio store to avoid audio initialization in tests
vi.mock('../useAudio', () => ({
  useAudio: {
    getState: () => ({
      playHit: vi.fn(),
    }),
  },
}));

describe('useSnakeGame wrap-around functionality', () => {
  const GRID_WIDTH = 28;
  const GRID_HEIGHT = 16;
  
  beforeEach(() => {
    // Reset the store state before each test
    const { resetGame } = useSnakeGame.getState();
    resetGame();
  });

  describe('moveSnake() wrap-around behavior', () => {
    it('should wrap snake head from left edge to right edge', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake at left edge, facing left
      useSnakeGame.setState({
        snake: [{ x: 0, y: Math.floor(GRID_HEIGHT / 2) }],
        direction: 'left',
        nextDirection: 'left',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake left from x=0
      store.moveSnake();
      
      const { snake } = useSnakeGame.getState();
      
      // Should wrap to rightmost position (x=27)
      expect(snake[0].x).toBe(GRID_WIDTH - 1);
      expect(snake[0].y).toBe(Math.floor(GRID_HEIGHT / 2));
    });

    it('should wrap snake head from right edge to left edge', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake at right edge, facing right
      useSnakeGame.setState({
        snake: [{ x: GRID_WIDTH - 1, y: 8 }],
        direction: 'right',
        nextDirection: 'right',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake right from x=27
      store.moveSnake();
      
      const { snake } = useSnakeGame.getState();
      
      // Should wrap to leftmost position (x=0)
      expect(snake[0].x).toBe(0);
      expect(snake[0].y).toBe(8);
    });

    it('should wrap snake head from top edge to bottom edge', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake at top edge, facing up
      useSnakeGame.setState({
        snake: [{ x: 14, y: 0 }],
        direction: 'up',
        nextDirection: 'up',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake up from y=0
      store.moveSnake();
      
      const { snake } = useSnakeGame.getState();
      
      // Should wrap to bottommost position (y=15)
      expect(snake[0].x).toBe(14);
      expect(snake[0].y).toBe(GRID_HEIGHT - 1);
    });

    it('should wrap snake head from bottom edge to top edge', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake at bottom edge, facing down
      useSnakeGame.setState({
        snake: [{ x: 42, y: GRID_HEIGHT - 1 }],
        direction: 'down',
        nextDirection: 'down',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake down from y=47
      store.moveSnake();
      
      const { snake } = useSnakeGame.getState();
      
      // Should wrap to topmost position (y=0)
      expect(snake[0].x).toBe(14);
      expect(snake[0].y).toBe(0);
    });

    it('should wrap snake head diagonally (corner case)', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake at top-left corner, facing left then up
      useSnakeGame.setState({
        snake: [{ x: 0, y: 0 }],
        direction: 'left',
        nextDirection: 'left',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move left from (0, 0) - should wrap to (83, 0)
      store.moveSnake();
      
      let { snake } = useSnakeGame.getState();
      expect(snake[0].x).toBe(GRID_WIDTH - 1);
      expect(snake[0].y).toBe(0);
      
      // Now change direction to up and move
      store.setDirection('up');
      store.moveSnake();
      
      ({ snake } = useSnakeGame.getState());
      expect(snake[0].x).toBe(GRID_WIDTH - 1);
      expect(snake[0].y).toBe(GRID_HEIGHT - 1);
    });

    it('should maintain snake body segments after head wraps', () => {
      const store = useSnakeGame.getState();
      
      // Set up a 3-segment snake at left edge
      useSnakeGame.setState({
        snake: [
          { x: 0, y: 8 }, // Head
          { x: 1, y: 8 }, // Body
          { x: 2, y: 8 }, // Tail
        ],
        direction: 'left',
        nextDirection: 'left',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake left - head wraps, body follows normally
      store.moveSnake();
      
      const { snake } = useSnakeGame.getState();
      
      // Head should wrap to right edge
      expect(snake[0].x).toBe(GRID_WIDTH - 1);
      expect(snake[0].y).toBe(8);
      
      // Body should follow where head was
      expect(snake[1].x).toBe(0);
      expect(snake[1].y).toBe(8);
      
      // Previous body becomes tail
      expect(snake[2].x).toBe(1);
      expect(snake[2].y).toBe(8);
      
      expect(snake).toHaveLength(3);
    });

    it('should not trigger collision when head wraps to empty space', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake that will wrap but not collide
      useSnakeGame.setState({
        snake: [
          { x: 0, y: 24 }, // Head
          { x: 1, y: 24 }, // Body  
        ],
        direction: 'left',
        nextDirection: 'left',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake left - should wrap without collision
      store.moveSnake();
      
      const { snake, gameOver } = useSnakeGame.getState();
      
      expect(gameOver).toBe(false);
      expect(snake[0].x).toBe(GRID_WIDTH - 1);
    });

    it('should trigger collision when head wraps into snake body', () => {
      const store = useSnakeGame.getState();
      
      // Set up snake where head will wrap into body
      useSnakeGame.setState({
        snake: [
          { x: 0, y: 8 }, // Head
          { x: 1, y: 8 }, // Body
          { x: 2, y: 8 }, // Body
          { x: GRID_WIDTH - 1, y: 8 }, // Body at wrap position
        ],
        direction: 'left',
        nextDirection: 'left',
        food: { x: 10, y: 10 },
        gameOver: false,
        isPaused: false,
      });
      
      // Move snake left - head wraps into body segment
      store.moveSnake();
      
      const { gameOver } = useSnakeGame.getState();
      
      expect(gameOver).toBe(true);
    });
  });

  describe('edge coordinate validation', () => {
    it('should keep all coordinates within grid bounds after wrapping', () => {
      const store = useSnakeGame.getState();
      
      // Test all four directions from edge positions
      const testCases = [
        { pos: { x: 0, y: Math.floor(GRID_HEIGHT / 2) }, dir: 'left', expectedX: GRID_WIDTH - 1, expectedY: Math.floor(GRID_HEIGHT / 2) },
        { pos: { x: GRID_WIDTH - 1, y: Math.floor(GRID_HEIGHT / 2) }, dir: 'right', expectedX: 0, expectedY: Math.floor(GRID_HEIGHT / 2) },
        { pos: { x: Math.floor(GRID_WIDTH / 2), y: 0 }, dir: 'up', expectedX: Math.floor(GRID_WIDTH / 2), expectedY: GRID_HEIGHT - 1 },
        { pos: { x: Math.floor(GRID_WIDTH / 2), y: GRID_HEIGHT - 1 }, dir: 'down', expectedX: Math.floor(GRID_WIDTH / 2), expectedY: 0 },
      ];
      
      testCases.forEach(({ pos, dir, expectedX, expectedY }) => {
        useSnakeGame.setState({
          snake: [pos],
          direction: dir as any,
          nextDirection: dir as any,
          food: { x: 10, y: 10 },
          gameOver: false,
          isPaused: false,
        });
        
        store.moveSnake();
        
        const { snake } = useSnakeGame.getState();
        
        expect(snake[0].x).toBeGreaterThanOrEqual(0);
        expect(snake[0].x).toBeLessThan(GRID_WIDTH);
        expect(snake[0].y).toBeGreaterThanOrEqual(0);
        expect(snake[0].y).toBeLessThan(GRID_HEIGHT);
        
        expect(snake[0].x).toBe(expectedX);
        expect(snake[0].y).toBe(expectedY);
      });
    });
  });
});