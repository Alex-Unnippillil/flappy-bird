// File Overview: This module belongs to src/model/count.ts.
import { COUNT_COORDINATE, COUNT_DIMENSION } from '../constants';
import { rescaleDim } from '../utils';

import ParentClass from '../abstracts/parent-class';

type TSegment = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

const DIGIT_SEGMENTS: readonly (readonly TSegment[])[] = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['B', 'C'],
  ['A', 'B', 'G', 'E', 'D'],
  ['A', 'B', 'G', 'C', 'D'],
  ['F', 'G', 'B', 'C'],
  ['A', 'F', 'G', 'C', 'D'],
  ['A', 'F', 'G', 'C', 'D', 'E'],
  ['A', 'B', 'C'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['A', 'B', 'C', 'D', 'F', 'G']
];

export default class Count extends ParentClass {
  private currentValue: number;
  private numberDimension: IDimension;
  private digitCache: Map<string, HTMLCanvasElement>;
  private readonly aspectRatio: number;
  private readonly digitSpacingRatio: number;

  constructor() {
    super();

    this.currentValue = 0;
    this.numberDimension = {
      width: 0,
      height: 0
    };
    this.digitCache = new Map();
    this.aspectRatio = COUNT_DIMENSION.width / COUNT_DIMENSION.height;
    this.digitSpacingRatio = 0.08;
  }

  public init(): void {
    // Pre-render digits so runtime `Display` only performs cheap drawImage calls.
    for (let digit = 0; digit <= 9; digit += 1) {
      this.getDigitCanvas(String(digit));
    }
  }

  public setNum(value: number): void {
    this.currentValue = value;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });
    this.numberDimension = rescaleDim(COUNT_DIMENSION, {
      height: height * 0.065
    });

    this.coordinate.x = this.canvasSize.width * COUNT_COORDINATE.x;
    this.coordinate.y = this.canvasSize.height * COUNT_COORDINATE.y;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public Update(): void {}

  public Display(context: CanvasRenderingContext2D): void {
    const digits = String(this.currentValue).split('');
    const gap = this.numberDimension.width * this.digitSpacingRatio;
    const totalWidth =
      digits.length * this.numberDimension.width +
      Math.max(0, digits.length - 1) * gap;
    let cursor = this.coordinate.x - totalWidth / 2;
    const topPos = this.coordinate.y - this.numberDimension.height / 2;

    digits.forEach((digit) => {
      const digitCanvas = this.getDigitCanvas(digit);

      context.drawImage(
        digitCanvas,
        cursor,
        topPos,
        this.numberDimension.width,
        this.numberDimension.height
      );

      cursor += this.numberDimension.width + gap;
    });
  }

  private getDigitCanvas(digit: string): HTMLCanvasElement {
    let canvas = this.digitCache.get(digit);

    if (canvas) return canvas;

    canvas = document.createElement('canvas');

    // Render at a very high resolution so scaling down on high-DPI screens
    // stays sharp.
    const baseHeight = 512;
    const baseWidth = Math.round(baseHeight * this.aspectRatio);

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    const context = canvas.getContext('2d');

    if (context) {
      const parsed = Number.parseInt(digit, 10);
      const digitIndex = Number.isNaN(parsed)
        ? 0
        : Math.min(Math.max(parsed, 0), DIGIT_SEGMENTS.length - 1);

      this.drawDigit(context, digitIndex, baseWidth, baseHeight);
      this.digitCache.set(digit, canvas);
    }

    return canvas;
  }

  private drawDigit(
    context: CanvasRenderingContext2D,
    digit: number,
    width: number,
    height: number
  ): void {
    const segments = DIGIT_SEGMENTS[digit];

    context.clearRect(0, 0, width, height);
    context.lineJoin = 'round';
    context.lineCap = 'round';

    const padX = width * 0.18;
    const padY = height * 0.12;
    const topY = padY;
    const bottomY = height - padY;
    const centerY = height / 2;
    const thickness = height * 0.17;
    const outline = thickness * 0.3;
    const inset = thickness * 0.12;
    const gap = thickness * 0.65;
    const verticalTopEnd = centerY - gap / 2;
    const verticalBottomStart = centerY + gap / 2;
    const verticalStart = topY + thickness / 2;
    const verticalEnd = bottomY - thickness / 2;

    const segmentLookup: Record<TSegment, [number, number, number, number]> = {
      A: [padX + inset, topY, width - padX - inset, topY],
      B: [width - padX, verticalStart, width - padX, verticalTopEnd],
      C: [width - padX, verticalBottomStart, width - padX, verticalEnd],
      D: [padX + inset, bottomY, width - padX - inset, bottomY],
      E: [padX, verticalBottomStart, padX, verticalEnd],
      F: [padX, verticalStart, padX, verticalTopEnd],
      G: [padX + inset, centerY, width - padX - inset, centerY]
    };

    const drawSegments = (
      strokeStyle: CanvasGradient | string,
      lineWidth: number,
      offsetX = 0,
      offsetY = 0
    ) => {
      context.save();
      context.translate(offsetX, offsetY);
      context.strokeStyle = strokeStyle;
      context.lineWidth = lineWidth;

      segments.forEach((segment) => {
        const [x1, y1, x2, y2] = segmentLookup[segment];
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      });

      context.restore();
    };

    const dropShadowOffset = thickness * 0.22;
    drawSegments('rgba(0, 0, 0, 0.35)', thickness + outline, dropShadowOffset, dropShadowOffset);

    drawSegments('rgba(12, 14, 18, 0.85)', thickness + outline);

    const fill = context.createLinearGradient(0, topY, 0, bottomY);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(0.6, '#f1f5f9');
    fill.addColorStop(1, '#dce1e9');
    drawSegments(fill, thickness);

    const highlight = context.createLinearGradient(0, topY, 0, centerY);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    drawSegments(highlight, thickness * 0.45);
  }
}
