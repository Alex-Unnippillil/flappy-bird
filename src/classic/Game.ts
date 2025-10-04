import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_SPEED, SCORE_NUMBER_HEIGHT } from './constants.ts';
import { playSound, preloadAudio } from './assets.ts';
import type { Dimension } from './types.ts';
import { Background } from './entities/Background.ts';
import { Bird } from './entities/Bird.ts';
import { PipeField } from './entities/PipeField.ts';
import { Platform } from './entities/Platform.ts';
import { loadSpriteSheet, type SpriteName, type SpriteSheet } from './spriteSheet.ts';

export type GameState = 'intro' | 'running' | 'gameover';

interface HudRefs {
  score: HTMLElement | null;
  best: HTMLElement | null;
  overlay: HTMLElement | null;
  message: HTMLElement | null;
  startButton: HTMLButtonElement | null;
}

const PANEL_BACKGROUND = '#fef8dc';
const PANEL_BORDER = '#352c2a';
const PANEL_SHADOW = 'rgba(0, 0, 0, 0.25)';

const SCORE_NUMBER_MEDIUM_HEIGHT = 20;

const MEDAL_SPRITES: { threshold: number; sprite: SpriteName }[] = [
  { threshold: 40, sprite: 'coin-shine-silver' },
  { threshold: 30, sprite: 'coin-shine-gold' },
  { threshold: 20, sprite: 'coin-dull-metal' },
  { threshold: 10, sprite: 'coin-dull-bronze' },
];

const BIRD_SKINS = ['yellow', 'blue', 'red'] as const;
type BirdSkin = (typeof BIRD_SKINS)[number];

function loadBestScore(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const stored = window.localStorage.getItem('flappy-best');
  return stored ? Number.parseInt(stored, 10) || 0 : 0;
}

function saveBestScore(score: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem('flappy-best', String(score));
  } catch (error) {
    console.warn('Unable to persist best score', error);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export class ClassicGame {
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferCtx: CanvasRenderingContext2D;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly size: Dimension = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  private readonly hud: HudRefs;

  private background: Background;
  private platform: Platform;
  private bird: Bird;
  private pipes: PipeField;

  private state: GameState = 'intro';
  private animationId: number | null = null;
  private lastTimestamp: number | null = null;
  private score = 0;
  private bestScore = loadBestScore();
  private audioPreloaded = false;
  private spriteSheet: SpriteSheet | null = null;
  private newHighScoreAchieved = false;
  private readonly birdSkins: BirdSkin[] = [...BIRD_SKINS];
  private readonly onStartButtonClick: () => void;

  constructor(private readonly canvas: HTMLCanvasElement, hudSelectors: Record<string, string>) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to acquire 2D rendering context');
    }
    this.ctx = ctx;
    this.buffer = document.createElement('canvas');
    this.bufferCtx = this.buffer.getContext('2d', { alpha: false })!;
    this.buffer.width = CANVAS_WIDTH;
    this.buffer.height = CANVAS_HEIGHT;

    this.background = new Background(this.size);
    this.platform = new Platform(this.size);
    this.bird = new Bird(this.size);
    this.pipes = new PipeField(this.size, this.platform.getHeight());

    this.hud = {
      score: document.querySelector(hudSelectors.score ?? ''),
      best: document.querySelector(hudSelectors.best ?? ''),
      overlay: document.querySelector(hudSelectors.overlay ?? ''),
      message: document.querySelector(hudSelectors.message ?? ''),
      startButton: document.querySelector(hudSelectors.startButton ?? '') as HTMLButtonElement | null,
    };

    this.onStartButtonClick = () => this.handlePrimaryAction();
    this.hud.startButton?.addEventListener('click', this.onStartButtonClick);
  }

  async init(): Promise<void> {
    this.resizeToCanvas();
    this.updateHud();
    this.enterIntro();
    this.startLoop();
    try {
      this.spriteSheet = await loadSpriteSheet();
      this.applySpriteSheet();
    } catch (error) {
      console.warn('Failed to load sprite atlas', error);
    }
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.hud.startButton?.removeEventListener('click', this.onStartButtonClick);
  }

  private setState(next: GameState): void {
    this.state = next;
  }

  private resizeToCanvas(): void {
    const currentSkin: BirdSkin = this.bird?.getSkin?.() ?? 'yellow';
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(CANVAS_WIDTH * dpr);
    this.canvas.height = Math.round(CANVAS_HEIGHT * dpr);

    this.size.width = this.buffer.width = CANVAS_WIDTH;
    this.size.height = this.buffer.height = CANVAS_HEIGHT;

    this.background = new Background(this.size);
    this.platform = new Platform(this.size);
    this.bird = new Bird(this.size);
    this.bird.setSkin(currentSkin);
    this.pipes = new PipeField(this.size, this.platform.getHeight());
    this.applySpriteSheet();
  }

  resize(): void {
    this.resizeToCanvas();
  }

  private applySpriteSheet(): void {
    const sheet = this.spriteSheet;
    this.background.setSpriteSheet(sheet);
    this.platform.setSpriteSheet(sheet);
    this.bird.setSpriteSheet(sheet);
    this.pipes.setSpriteSheet(sheet);
  }

  private randomBirdSkin(): BirdSkin {
    return this.birdSkins[Math.floor(Math.random() * this.birdSkins.length)];
  }

  private getMedalSprite(): SpriteName | null {
    const entry = MEDAL_SPRITES.find(({ threshold }) => this.score >= threshold);
    return entry?.sprite ?? null;
  }

  private enterIntro(): void {
    this.setState('intro');
    this.score = 0;
    this.updateHud();
    this.lastTimestamp = null;
    this.hud.overlay?.removeAttribute('hidden');
    if (this.hud.message) {
      this.hud.message.textContent = 'Tap or press Space to start';
    }
    this.hud.startButton?.removeAttribute('hidden');
  }

  private startLoop(): void {
    const tick = (timestamp: number) => {
      this.animationId = requestAnimationFrame(tick);
      this.step(timestamp);
    };
    this.animationId = requestAnimationFrame(tick);
  }

  private step(timestamp: number): void {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
      return;
    }

    const deltaMs = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    const deltaFrames = Math.min(deltaMs / (1000 / 60), 3);

    if (this.state === 'running') {
      this.updateRunning(deltaFrames);
    } else if (this.state === 'intro') {
      this.background.update(deltaFrames, GAME_SPEED * this.size.width);
      this.platform.update(deltaFrames, GAME_SPEED * this.size.width);
      this.bird.update(deltaFrames * 0.4, this.size);
    } else if (this.state === 'gameover') {
      this.background.update(deltaFrames * 0.5, GAME_SPEED * this.size.width * 0.5);
      this.platform.update(deltaFrames * 0.5, GAME_SPEED * this.size.width * 0.5);
      this.bird.update(deltaFrames, this.size);
    }

    this.render();
  }

  private updateRunning(deltaFrames: number): void {
    const speedPxPerMs = GAME_SPEED * this.size.width;
    this.background.update(deltaFrames, speedPxPerMs);
    this.platform.update(deltaFrames, speedPxPerMs);
    this.pipes.update(deltaFrames, speedPxPerMs);
    this.bird.update(deltaFrames, this.size);

    const platformHeight = this.platform.getHeight();
    const bounds = this.bird.getBounds();

    for (const pipe of this.pipes.getPipes()) {
      if (!pipe.hasBeenPassed() && bounds.left > pipe.x) {
        pipe.markPassed();
        this.incrementScore();
      }
      if (pipe.collides(bounds)) {
        this.triggerGameOver();
        return;
      }
    }

    if (bounds.bottom >= this.size.height - platformHeight) {
      this.triggerGameOver();
      return;
    }

    if (bounds.top <= 0) {
      this.triggerGameOver();
      return;
    }
  }

  private incrementScore(): void {
    this.score += 1;
    playSound('score');
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.newHighScoreAchieved = true;
      saveBestScore(this.bestScore);
    }
    this.updateHud();
  }

  private render(): void {
    const ctx = this.bufferCtx;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);

    this.background.draw(ctx);

    for (const pipe of this.pipes.getPipes()) {
      pipe.draw(ctx);
    }

    this.platform.draw(ctx);
    this.bird.draw(ctx);

    if (this.state === 'intro') {
      this.drawIntro(ctx);
    } else if (this.state === 'gameover') {
      this.drawGameOver(ctx);
    } else {
      this.drawScore(ctx, this.score, this.buffer.width / 2, this.buffer.height * 0.1);
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }

  private drawIntro(ctx: CanvasRenderingContext2D): void {
    if (this.spriteSheet) {
      const sheet = this.spriteSheet;
      const baseScale = this.buffer.width / CANVAS_WIDTH;
      const centerX = this.buffer.width / 2;

      this.drawScore(ctx, 0, centerX, this.buffer.height * 0.08, { spriteSet: 'lg' });

      const flapFrame = sheet.getFrame('banner-flappybird');
      const flapWidth = flapFrame.width * baseScale;
      const flapHeight = flapFrame.height * baseScale;
      sheet.draw(
        ctx,
        'banner-flappybird',
        centerX - flapWidth / 2,
        this.buffer.height * 0.18,
        flapWidth,
        flapHeight
      );

      const readyFrame = sheet.getFrame('banner-game-ready');
      const readyWidth = readyFrame.width * baseScale;
      const readyHeight = readyFrame.height * baseScale;
      sheet.draw(
        ctx,
        'banner-game-ready',
        centerX - readyWidth / 2,
        this.buffer.height * 0.32,
        readyWidth,
        readyHeight
      );

      const instructionFrame = sheet.getFrame('banner-instruction');
      const instructionWidth = instructionFrame.width * baseScale;
      const instructionHeight = instructionFrame.height * baseScale;
      sheet.draw(
        ctx,
        'banner-instruction',
        centerX - instructionWidth / 2,
        this.buffer.height * 0.46,
        instructionWidth,
        instructionHeight
      );
      return;
    }

    const panelWidth = this.buffer.width * 0.72;
    const panelHeight = this.buffer.height * 0.28;
    const panelX = (this.buffer.width - panelWidth) / 2;
    const panelY = this.buffer.height * 0.22;

    ctx.save();
    ctx.fillStyle = PANEL_SHADOW;
    drawRoundedRect(ctx, panelX + 4, panelY + 6, panelWidth, panelHeight, panelWidth * 0.08);
    ctx.fill();

    ctx.fillStyle = PANEL_BACKGROUND;
    ctx.strokeStyle = PANEL_BORDER;
    ctx.lineWidth = panelWidth * 0.02;
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, panelWidth * 0.08);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PANEL_BORDER;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const titleSize = panelHeight * 0.28;
    ctx.font = `bold ${titleSize}px 'Press Start 2P', 'Fira Sans', sans-serif`;
    ctx.fillText('Get Ready', this.buffer.width / 2, panelY + panelHeight * 0.12);

    const bodySize = panelHeight * 0.18;
    ctx.font = `600 ${bodySize}px 'Fira Sans', sans-serif`;
    ctx.fillText('Tap or press Space', this.buffer.width / 2, panelY + panelHeight * 0.52);
    ctx.fillText('Avoid the pipes!', this.buffer.width / 2, panelY + panelHeight * 0.72);
    ctx.font = `600 ${bodySize * 0.85}px 'Fira Sans', sans-serif`;
    ctx.fillText(`Best: ${this.bestScore}`, this.buffer.width / 2, panelY + panelHeight * 0.86);
    ctx.restore();

    this.drawScore(ctx, 0, this.buffer.width / 2, this.buffer.height * 0.1);
  }

  private drawScore(
    ctx: CanvasRenderingContext2D,
    value: number,
    centerX: number,
    top: number,
    options: { fontSize?: number; align?: CanvasTextAlign; spriteSet?: 'lg' | 'md' } = {}
  ): void {
    if (this.spriteSheet) {
      this.drawSpriteScore(ctx, value, centerX, top, options);
      return;
    }
    const scale = this.buffer.height / CANVAS_HEIGHT;
    const fontSize = (options.fontSize ?? SCORE_NUMBER_HEIGHT) * scale;

    ctx.save();
    ctx.font = `bold ${fontSize}px 'Press Start 2P', 'Fira Sans', sans-serif`;
    ctx.textAlign = options.align ?? 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.18;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillStyle = '#ffffff';
    const text = String(Math.max(0, value));
    ctx.strokeText(text, centerX, top);
    ctx.fillText(text, centerX, top);
    ctx.restore();
  }

  private drawSpriteScore(
    ctx: CanvasRenderingContext2D,
    value: number,
    centerX: number,
    top: number,
    options: { fontSize?: number; align?: CanvasTextAlign; spriteSet?: 'lg' | 'md' }
  ): void {
    if (!this.spriteSheet) {
      return;
    }

    const digits = [...String(Math.max(0, value))];
    const spriteSet = options.spriteSet ?? 'lg';
    const prefix = spriteSet === 'md' ? 'number-md' : 'number-lg';
    const scale = this.buffer.height / CANVAS_HEIGHT;
    const baseHeight = spriteSet === 'md' ? SCORE_NUMBER_MEDIUM_HEIGHT : SCORE_NUMBER_HEIGHT;
    const targetHeight = (options.fontSize ?? baseHeight) * scale;
    const spacing = targetHeight * 0.12;
    const frameNames = digits.map((digit) => `${prefix}-${digit}` as SpriteName);
    const widths = frameNames.map((name) => {
      const frame = this.spriteSheet!.getFrame(name);
      return (frame.width / frame.height) * targetHeight;
    });

    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(digits.length - 1, 0);
    let startX = centerX;
    const align = options.align ?? 'center';
    if (align === 'center') {
      startX -= totalWidth / 2;
    } else if (align === 'right') {
      startX -= totalWidth;
    }

    let cursor = startX;
    frameNames.forEach((name, index) => {
      const width = widths[index];
      this.spriteSheet!.draw(ctx, name, cursor, top, width, targetHeight);
      cursor += width + spacing;
    });
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    if (this.spriteSheet) {
      const sheet = this.spriteSheet;
      const baseScale = this.buffer.width / CANVAS_WIDTH;
      const centerX = this.buffer.width / 2;

      const bannerFrame = sheet.getFrame('banner-game-over');
      const bannerWidth = bannerFrame.width * baseScale;
      const bannerHeight = bannerFrame.height * baseScale;
      sheet.draw(
        ctx,
        'banner-game-over',
        centerX - bannerWidth / 2,
        this.buffer.height * 0.16,
        bannerWidth,
        bannerHeight
      );

      const boardFrame = sheet.getFrame('score-board');
      const boardScale = baseScale * 1.05;
      const boardWidth = boardFrame.width * boardScale;
      const boardHeight = boardFrame.height * boardScale;
      const boardX = centerX - boardWidth / 2;
      const boardY = this.buffer.height * 0.32;
      sheet.draw(ctx, 'score-board', boardX, boardY, boardWidth, boardHeight);

      const scoreX = boardX + boardWidth * 0.75;
      const scoreY = boardY + boardHeight * 0.3;
      this.drawScore(ctx, this.score, scoreX, scoreY, {
        align: 'right',
        spriteSet: 'md',
        fontSize: SCORE_NUMBER_MEDIUM_HEIGHT,
      });

      const bestY = boardY + boardHeight * 0.6;
      this.drawScore(ctx, this.bestScore, scoreX, bestY, {
        align: 'right',
        spriteSet: 'md',
        fontSize: SCORE_NUMBER_MEDIUM_HEIGHT,
      });

      if (this.newHighScoreAchieved) {
        const toastFrame = sheet.getFrame('toast-new');
        const toastWidth = toastFrame.width * baseScale;
        const toastHeight = toastFrame.height * baseScale;
        sheet.draw(
          ctx,
          'toast-new',
          scoreX - toastWidth - 10 * baseScale,
          scoreY - toastHeight * 1.2,
          toastWidth,
          toastHeight
        );
      }

      const medalSprite = this.getMedalSprite();
      if (medalSprite) {
        const frame = sheet.getFrame(medalSprite);
        const medalHeight = boardHeight * 0.36;
        const medalWidth = medalHeight * (frame.width / frame.height);
        const medalX = boardX + boardWidth * 0.2 - medalWidth / 2;
        const medalY = boardY + boardHeight * 0.58 - medalHeight / 2;
        sheet.draw(ctx, medalSprite, medalX, medalY, medalWidth, medalHeight);
      }

      return;
    }

    const panelWidth = this.buffer.width * 0.78;
    const panelHeight = this.buffer.height * 0.36;
    const panelX = (this.buffer.width - panelWidth) / 2;
    const panelY = this.buffer.height * 0.26;

    ctx.save();
    ctx.fillStyle = PANEL_SHADOW;
    drawRoundedRect(ctx, panelX + 5, panelY + 7, panelWidth, panelHeight, panelWidth * 0.08);
    ctx.fill();

    ctx.fillStyle = PANEL_BACKGROUND;
    ctx.strokeStyle = PANEL_BORDER;
    ctx.lineWidth = panelWidth * 0.02;
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, panelWidth * 0.08);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PANEL_BORDER;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const titleSize = panelHeight * 0.26;
    ctx.font = `bold ${titleSize}px 'Press Start 2P', 'Fira Sans', sans-serif`;
    ctx.fillText('Game Over', this.buffer.width / 2, panelY + panelHeight * 0.12);

    const labelSize = panelHeight * 0.16;
    ctx.font = `600 ${labelSize}px 'Fira Sans', sans-serif`;
    const labelY = panelY + panelHeight * 0.46;
    ctx.textAlign = 'left';
    ctx.fillText('Score', panelX + panelWidth * 0.1, labelY);
    ctx.fillText('Best', panelX + panelWidth * 0.1, labelY + panelHeight * 0.22);

    this.drawScore(ctx, this.score, panelX + panelWidth * 0.9, labelY - labelSize * 0.08, {
      align: 'right',
      fontSize: SCORE_NUMBER_HEIGHT * 0.9,
    });
    this.drawScore(ctx, this.bestScore, panelX + panelWidth * 0.9, labelY + panelHeight * 0.22 - labelSize * 0.08, {
      align: 'right',
      fontSize: SCORE_NUMBER_HEIGHT * 0.9,
    });

    const medalColor = this.score >= 20 ? '#f5c542' : this.score >= 10 ? '#d1d5db' : null;
    if (medalColor) {
      ctx.fillStyle = medalColor;
      ctx.beginPath();
      const radius = panelWidth * 0.12;
      const medalX = panelX + panelWidth * 0.24;
      const medalY = panelY + panelHeight * 0.62;
      ctx.arc(medalX, medalY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PANEL_BORDER;
      ctx.font = `bold ${radius * 0.9}px 'Press Start 2P', 'Fira Sans', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.score >= 20 ? 'G' : 'S', medalX, medalY);
    }

    ctx.restore();
  }

  handlePrimaryAction(): void {
    if (this.state === 'intro') {
      this.startGame();
      this.bird.flap();
      return;
    }

    if (this.state === 'running') {
      this.bird.flap();
      return;
    }

    if (this.state === 'gameover') {
      this.startGame();
      this.bird.flap();
    }
  }

  private startGame(): void {
    this.setState('running');
    this.hud.overlay?.setAttribute('hidden', 'true');
    this.hud.startButton?.setAttribute('hidden', 'true');
    this.background.chooseTheme();
    this.platform = new Platform(this.size);
    this.bird = new Bird(this.size);
    this.bird.setSkin(this.randomBirdSkin());
    this.pipes = new PipeField(this.size, this.platform.getHeight());
    this.applySpriteSheet();
    this.pipes.forceSpawn(2, 220);
    this.score = 0;
    this.newHighScoreAchieved = false;
    this.updateHud();
    this.lastTimestamp = null;

    if (!this.audioPreloaded) {
      this.audioPreloaded = true;
      void preloadAudio();
    }
  }

  private triggerGameOver(): void {
    if (this.state !== 'running') {
      return;
    }
    this.setState('gameover');
    this.bird.kill();
    this.hud.overlay?.removeAttribute('hidden');
    if (this.hud.message) {
      this.hud.message.textContent = 'Game over! Tap to play again';
    }
    this.hud.startButton?.removeAttribute('hidden');
    playSound('hit');
    playSound('die');
  }

  private updateHud(): void {
    if (this.hud.score) {
      this.hud.score.textContent = String(this.score);
    }
    if (this.hud.best) {
      this.hud.best.textContent = String(this.bestScore);
    }
  }
}
