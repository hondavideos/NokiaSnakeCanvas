# Nokia 3310 Snake Game

## Overview

This is a pixel-perfect recreation of the classic Nokia 3310 Snake game built as a modern web application. The project simulates the nostalgic experience of playing Snake on the iconic Nokia phone, complete with authentic visual styling and gameplay mechanics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system based on shadcn/ui components
- **State Management**: Zustand for lightweight, centralized state management
- **Game Engine**: Custom Canvas-based rendering with pixel-perfect Nokia 3310 simulation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with tsx for development server
- **Production**: Compiled with esbuild for optimal performance

## Key Components

### Game Engine
- **Canvas Rendering**: Custom pixel-perfect Snake game implementation
- **Game Loop**: Precise timing system matching Nokia 3310 behavior
- **Input System**: Keyboard controls with mobile touch support
- **Audio System**: Optional sound effects with mute functionality

### UI Components
- **Nokia Phone Frame**: Authentic Nokia 3310 visual recreation
- **Screen Simulation**: Exact aspect ratio (7:4) matching original hardware
- **Responsive Layout**: Centered phone display with proper scaling
- **Debug Mode**: Developer tools for alignment and testing (Ctrl+Shift+D)

### State Management
- **Game State**: Snake position, food, score, and game phase tracking
- **Audio State**: Sound management with mute/unmute functionality
- **UI State**: Screen dimensions, debug mode, and responsive behavior

## Data Flow

### Game State Flow
1. **Ready Phase**: Game initialized, waiting for user input
2. **Playing Phase**: Active gameplay with snake movement and collision detection
3. **Ended Phase**: Game over state with score display and restart option

### Input Handling
1. Keyboard events captured globally
2. Touch events processed for mobile devices
3. Direction changes queued to prevent invalid moves
4. Game control actions (pause, restart, mute) handled separately

### Rendering Pipeline
1. Canvas cleared on each frame
2. Snake segments drawn with Nokia-style pixels
3. Food rendered at calculated positions
4. UI overlays positioned absolutely over game canvas

## External Dependencies

### Core Framework Dependencies
- **React**: UI framework with hooks and modern patterns
- **Express**: Backend server framework
- **Vite**: Development and build tooling
- **TypeScript**: Type safety across the entire codebase

### UI and Styling
- **Tailwind CSS**: Utility-first styling framework
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon system

### Game and Audio
- **Canvas API**: Native browser rendering
- **Web Audio API**: Sound effect playback
- **Zustand**: State management for game logic

### Development Tools
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Browser compatibility for CSS

## Database Schema

Currently uses an in-memory storage system with basic user management:

```typescript
// User entity for future features
interface User {
  id: number;
  username: string;
  password: string;
}
```

The application is prepared for database integration with:
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Production database (configured but not actively used)
- **Migration System**: Schema versioning with drizzle-kit

## Deployment Strategy

### Development Environment
- **Local Server**: Express with Vite middleware for hot reload
- **Asset Serving**: Static files served through Vite dev server
- **TypeScript Compilation**: Real-time compilation with error reporting

### Production Build
- **Frontend**: Vite builds optimized bundle to `dist/public`
- **Backend**: esbuild compiles server code to `dist/index.js`
- **Asset Pipeline**: Images, sounds, and fonts bundled efficiently
- **Environment Variables**: Database and configuration through environment

### File Structure
```
client/          # Frontend React application
server/          # Backend Express server
shared/          # Common types and schemas
migrations/      # Database migration files
dist/           # Production build output
```

### Build Commands
- `npm run dev`: Development with hot reload
- `npm run build`: Production build
- `npm run start`: Production server
- `npm run db:push`: Database schema updates

The architecture prioritizes performance, maintainability, and authentic recreation of the Nokia 3310 gaming experience while providing a solid foundation for future enhancements like user accounts, high score persistence, and multiplayer features.