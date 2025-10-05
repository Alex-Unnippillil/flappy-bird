<!-- File Overview: This markdown file documents README.md. -->

# Flappy Bird Web App

A modern web-based recreation of the classic Flappy Bird game, built with TypeScript and HTML5 Canvas. This project mimics the retro gameplay while incorporating modern web technologies for a smooth, responsive experience.

## Features

- **Classic Gameplay**: Authentic Flappy Bird mechanics with precise physics
- **Progressive Web App (PWA)**: Installable on mobile devices and desktops
- **Offline Support**: Service worker for offline gameplay
- **Responsive Design**: Adapts to different screen sizes
- **Sound Effects**: Immersive audio feedback
- **High Score Tracking**: Local storage for persistent scores
- **Smooth Animations**: 60 FPS gameplay with optimized rendering
- **Touch & Keyboard Controls**: Works on all devices

## Technologies Used

- **TypeScript**: Type-safe JavaScript for better development experience
- **HTML5 Canvas**: Hardware-accelerated 2D graphics rendering
- **Webpack**: Modern module bundling and asset optimization
- **Sass/SCSS**: Enhanced CSS with variables and mixins
- **Web Audio API**: High-performance audio processing
- **Service Workers**: Offline functionality and caching
- **PWA Manifest**: Native app-like experience

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alex-Unnippillil/flappy-bird.git
   cd flappy-bird
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   The game will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run start` - Alias for `npm run dev`
- `npm run prettier-format` - Format code with Prettier
- `npm run lint` - Run ESLint for code quality checks

## How to Play

1. **Tap/Space**: Make the bird flap and gain height
2. **Avoid Pipes**: Navigate through the gaps between pipes
3. **Score Points**: Pass through pipes to increase your score
4. **Don't Crash**: Hitting pipes or the ground ends the game

### Controls
- **Desktop**: Spacebar or mouse click
- **Mobile**: Tap the screen

## Project Structure

```
flappy-bird/
├── src/
│   ├── abstracts/          # Base classes and interfaces
│   ├── assets/             # Game sprites, sounds, and icons
│   ├── lib/                # Utility libraries and services
│   ├── model/              # Game entities (Bird, Pipes, etc.)
│   ├── screens/            # Game screens (Intro, Gameplay)
│   ├── styles/             # SCSS stylesheets
│   ├── utils/              # Helper functions
│   ├── constants.ts        # Game configuration
│   ├── events.ts           # Event handling
│   ├── game.ts             # Main game logic
│   └── index.ts            # Application entry point
├── types/                  # TypeScript type definitions
├── webpack.config.js       # Build configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Game Mechanics

### Physics System
- **Gravity**: Constant downward acceleration
- **Lift**: Instant upward velocity on flap
- **Rotation**: Dynamic bird rotation based on velocity
- **Collision**: Precise hit detection with pipes and boundaries

### Scoring System
- Points awarded for successfully passing through pipes
- High scores saved locally using browser storage

### Audio System
- Background music and sound effects
- Volume controls and mute functionality
- Web Audio API for low-latency playback

## Configuration

Game parameters can be adjusted in `src/constants.ts`:

- `GAME_SPEED`: Pipe movement speed
- `BIRD_JUMP_HEIGHT`: Bird flap strength
- `PIPE_DISTANCE`: Gap between pipes
- `SFX_VOLUME`: Audio volume level

## Progressive Web App

This game is a fully functional PWA with:
- **Installable**: Add to home screen on mobile devices
- **Offline Play**: Cached assets for offline gameplay
- **Fast Loading**: Optimized bundle sizes
- **Native Feel**: App-like interface and navigation

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Run ESLint before committing
- Test on multiple browsers
- Keep bundle size optimized

