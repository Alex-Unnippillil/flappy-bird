// File Overview: This module belongs to src/model/pipe.ts.
import { GAME_SPEED, PIPE_HOLL_SIZE, PIPE_INITIAL_DIMENSION } from '../constants';
import { rescaleDim } from '../utils';
import ParentClass from '../abstracts/parent-class';
import SpriteDestructor from '../lib/sprite-destructor';
import SceneGenerator from './scene-generator';
import HighContrastManager from '../lib/high-contrast-manager';

export interface IPipePairPosition {
  top: ICoordinate;
  bottom: ICoordinate;
}
export interface IPipeScaled {
  top: IDimension;
  bottom: IDimension;
}

export type IPipeColor = string;
export type IPipeRecords = Map<IPipeColor, HTMLImageElement>;

export default class Pipe extends ParentClass {
  /**
   *
   * */
  public static pipeSize: IDimension = {
    width: 0,
    height: 0
  };

  private scaled: IPipeScaled;
  public hollSize: number;
  public pipePosition: IPipePairPosition;
  public isPassed: boolean;

  private images: IPipeRecords;
  private color: IPipeColor;

  constructor() {
    super();
    this.images = new Map<string, HTMLImageElement>();
    this.color = 'green';
    this.hollSize = 0;
    this.pipePosition = {
      top: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 }
    };
    this.isPassed = false;
    this.velocity.x = GAME_SPEED;
    this.scaled = {
      top: { width: 0, height: 0 },
      bottom: { width: 0, height: 0 }
    };
  }

  public init(): void {
    this.images.set('green.top', SpriteDestructor.asset('pipe-green-top'));
    this.images.set('green.bottom', SpriteDestructor.asset('pipe-green-bottom'));
    this.images.set('red.top', SpriteDestructor.asset('pipe-red-top'));
    this.images.set('red.bottom', SpriteDestructor.asset('pipe-red-bottom'));

    Object.assign(SceneGenerator.pipeColorList, ['red', 'green']);
  }

  /**
   * Set holl position
   * */
  public setHollPosition(coordinate: ICoordinate): void {
    // Positioning holl
    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;

    /**
     * The Logic is
     *
     * Center Point = hollposition + (hollSize / 2)
     * */
    // From 0 to top boundary
    this.coordinate = coordinate;
  }

  /**
   * Resize the pipe based on screen size.
   *
   * To keep the to its position, during resizing event,
   * we convert the current coordinates of holl position
   * into percentages then save it. After that we can now
   * set the new size of the screen.
   *
   * After everything is set convert the previously saved value
   * of position of holl to back to the pixel with new dimensions.
   *
   * Set update the value of coordinate and we're good to go.
   * */
  public resize({ width, height }: IDimension): void {
    // Save the coordinate of pipe holl before resizing the canvas sizes
    const oldX = (this.coordinate.x / this.canvasSize.width) * 100;
    const oldY = (this.coordinate.y / this.canvasSize.height) * 100;

    super.resize({ width, height });

    // Update Pipe Size
    const min = this.canvasSize.width * 0.18;
    Pipe.pipeSize = rescaleDim(PIPE_INITIAL_DIMENSION, { width: min });

    // Resize holl size
    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;

    // Relocate the pipe holl
    this.coordinate.x = width * (oldX / 100);
    this.coordinate.y = height * (oldY / 100);

    // Update velocity. Converting percentages to pixels
    this.velocity.x = width * GAME_SPEED;

    const baseColor = this.images.has(`${this.color}.top`) ? this.color : 'green';

    this.scaled.top = rescaleDim(
      {
        width: this.images.get(`${baseColor}.top`)!.width,
        height: this.images.get(`${baseColor}.top`)!.height
      },
      { width: min }
    );

    this.scaled.bottom = rescaleDim(
      {
        width: this.images.get(`${baseColor}.bottom`)!.width,
        height: this.images.get(`${baseColor}.bottom`)!.height
      },
      { width: min }
    );
  }

  /**
   * Check if the pipe is out of canvas.
   * We're going to remove it to keep the game performance
   * good enough
   * */
  public isOut(): boolean {
    return this.coordinate.x + Pipe.pipeSize.width < 0;
  }

  /**
   * Pipe color selection
   * */
  public use(select: IPipeColor): void {
    this.color = select;
  }

  /**
   * Pipe Update
   * */
  public Update(): void {
    this.coordinate.x -= this.velocity.x;
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (HighContrastManager.isEnabled()) {
      this.displayHighContrast(context);
      return;
    }

    const width = Pipe.pipeSize.width / 2;

    const posX = this.coordinate.x;
    const posY = this.coordinate.y;
    const radius = this.hollSize / 2;

    const colorKey = this.images.has(`${this.color}.top`) ? this.color : 'green';

    context.drawImage(
      this.images.get(`${colorKey}.top`)!,
      posX - width,
      -(this.scaled.top.height - Math.abs(posY - radius)),
      this.scaled.top.width,
      this.scaled.top.height
    );

    context.drawImage(
      this.images.get(`${colorKey}.bottom`)!,
      posX - width,
      posY + radius,
      this.scaled.bottom.width,
      this.scaled.bottom.height
    );
  }

  private displayHighContrast(context: CanvasRenderingContext2D): void {
    const palette = HighContrastManager.getPalette();
    const width = Pipe.pipeSize.width / 2;
    const posX = this.coordinate.x - width;
    const radius = this.hollSize / 2;
    const topY = -(this.scaled.top.height - Math.abs(this.coordinate.y - radius));
    const bottomY = this.coordinate.y + radius;
    const lineWidth = Math.max(4, this.canvasSize.width * 0.01);
    const topAccent = Math.min(
      this.scaled.top.height * 0.35,
      Math.max(lineWidth * 1.2, this.canvasSize.height * 0.015)
    );
    const bottomAccent = Math.min(
      this.scaled.bottom.height * 0.35,
      Math.max(lineWidth * 1.2, this.canvasSize.height * 0.015)
    );

    context.save();
    context.fillStyle = palette.pipeFill;
    context.strokeStyle = palette.pipeStroke;
    context.lineWidth = lineWidth;
    context.lineJoin = 'round';

    this.drawPipeRect(context, posX, topY, this.scaled.top.width, this.scaled.top.height);
    this.drawPipeRect(context, posX, bottomY, this.scaled.bottom.width, this.scaled.bottom.height);

    context.fillStyle = palette.pipeAccent;
    this.drawPipeRect(context, posX, topY + this.scaled.top.height - topAccent, this.scaled.top.width, topAccent);
    this.drawPipeRect(context, posX, bottomY, this.scaled.bottom.width, bottomAccent);

    context.restore();
  }

  private drawPipeRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    context.beginPath();
    context.rect(x, y, width, height);
    context.fill();
    context.stroke();
  }
}
