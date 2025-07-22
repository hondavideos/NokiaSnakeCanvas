# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pixel-perfect recreation of the classic Nokia 3310 Snake game built as a modern web application. The project simulates the nostalgic Nokia phone experience with authentic visual styling and gameplay mechanics.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build (frontend + backend)
npm run build

# Start production server
npm start

# TypeScript type checking
npm run check

# Database schema management
npm run db:push
```

The development server runs on port 5000 and serves both the API and client application.

## Architecture

### Full-Stack TypeScript Application
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript, compiled with esbuild
- **State Management**: Zustand stores for game logic and audio
- **Database**: Drizzle ORM configured for PostgreSQL (currently using in-memory storage)

### Key Directories
- `client/`: React frontend application
- `server/`: Express backend with API routes
- `shared/`: Common schemas and types used by both client and server
- `client/src/components/`: React components including `NokiaScreen.tsx` and `SnakeGame.tsx`
- `client/src/lib/stores/`: Zustand state management stores

### Game Implementation Details
- **Canvas Rendering**: Custom pixel-perfect Snake game with Nokia 3310 dimensions (84x48 pixels)
- **Screen Aspect Ratio**: 7:4 matching original Nokia hardware
- **Render Scale**: 8x scaling for modern displays
- **Debug Mode**: Press Ctrl+Shift+D to toggle debug overlay and alignment markers

### State Management Stores
- `useSnakeGame.ts`: Core game logic (snake movement, collision detection, scoring)
- `useAudio.tsx`: Sound effects management with mute/unmute functionality
- `useGame.tsx`: General game state management

## Nokia Screen Positioning
The game is precisely positioned within the Nokia phone frame image:
- **Vertical Position**: 39.8% from top (moved down 10% from center)
- **Horizontal Position**: 50.05% from left (centered)
- **Screen Size**: 19.5% width with 7:4 aspect ratio
- **Transform**: `translate(-50%, -50%)` for perfect centering

## Audio System
- Sound files located in `client/public/sounds/`
- Hit sound for food collection (`hit.mp3`)
- Background music support (`background.mp3`)
- Volume control and mute functionality built-in

## Development Workflow
1. The app uses Vite for development with Express middleware integration
2. TypeScript compilation happens in real-time during development
3. Static assets are served from `client/public/` directory
4. Hot reload is enabled for both frontend and backend changes

## Database Integration
- Drizzle ORM configured with PostgreSQL support
- User schema defined in `shared/schema.ts`
- Migration system ready with drizzle-kit
- Currently using in-memory storage for simplicity

## Game Controls
- Arrow keys for snake movement
- Touch/swipe support for mobile devices
- Space bar to start/pause game
- R key to restart game
- M key to toggle mute

## Styling Architecture
- Tailwind CSS with custom Nokia-inspired design system
- shadcn/ui components for UI elements
- Custom CSS classes for Nokia phone styling and pixel-perfect positioning
- Responsive design with mobile touch support