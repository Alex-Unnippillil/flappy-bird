import {
  Box3,
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Sphere,
  Vector3,
} from 'three';

export interface Pipe3DOptions {
  readonly worldHeight: number;
  readonly gapSize: number;
  readonly width?: number;
  readonly depth?: number;
  readonly color?: string | number | Color;
  readonly x?: number;
  readonly z?: number;
}

const DEFAULT_PIPE_WIDTH = 52;
const DEFAULT_PIPE_DEPTH = 36;

const TRANSFORM_MATRICES = [new Matrix4(), new Matrix4()];
const TRANSFORM_QUATERNION = new Quaternion();
const TEMP_POSITION = new Vector3();
const TEMP_SCALE = new Vector3();

export class Pipe3D {
  public readonly group: Group;

  private readonly mesh: InstancedMesh;
  private readonly baseBounds: Box3;
  private readonly instanceBounds: [Box3, Box3];
  private readonly width: number;
  private readonly depth: number;
  private worldHeight: number;

  private gapSize: number;
  private gapCenter: number;
  private positionX: number;
  private readonly positionZ: number;

  public hasScored = false;

  constructor({
    worldHeight,
    gapSize,
    width = DEFAULT_PIPE_WIDTH,
    depth = DEFAULT_PIPE_DEPTH,
    color = 0x2ecc71,
    x = 0,
    z = 0,
  }: Pipe3DOptions) {
    this.width = width;
    this.depth = depth;
    this.worldHeight = worldHeight;
    this.gapSize = gapSize;
    this.gapCenter = worldHeight / 2;
    this.positionX = x;
    this.positionZ = z;

    const geometry = new BoxGeometry(1, 1, 1);
    geometry.computeBoundingBox();

    this.baseBounds = geometry.boundingBox?.clone() ?? new Box3().setFromCenterAndSize(new Vector3(), new Vector3(1, 1, 1));
    this.instanceBounds = [new Box3(), new Box3()] as [Box3, Box3];

    const material = new MeshStandardMaterial({ color: new Color(color) });
    this.mesh = new InstancedMesh(geometry, material, 2);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;

    this.group = new Group();
    this.group.add(this.mesh);

    this.rebuildInstances();
  }

  public get x(): number {
    return this.positionX;
  }

  public get halfWidth(): number {
    return (this.width * 0.5);
  }

  public setGapSize(gapSize: number): void {
    this.gapSize = gapSize;
    this.rebuildInstances();
  }

  public setWorldHeight(worldHeight: number): void {
    if (worldHeight === this.worldHeight) {
      return;
    }

    this.worldHeight = worldHeight;
    this.rebuildInstances();
  }

  public reposition(x: number, gapCenter: number, gapSize?: number): void {
    this.positionX = x;
    this.gapCenter = gapCenter;
    if (typeof gapSize === 'number') {
      this.gapSize = gapSize;
    }
    this.hasScored = false;
    this.rebuildInstances();
  }

  public update(deltaSeconds: number, speed: number): void {
    this.positionX -= speed * deltaSeconds;
    this.rebuildInstances();
  }

  public getAabbs(): readonly [Box3, Box3] {
    return this.instanceBounds;
  }

  public intersectsSphere(sphere: Sphere): boolean {
    return this.instanceBounds.some((bounds) => bounds.intersectsSphere(sphere));
  }

  public isOffscreen(leftBoundary: number): boolean {
    return this.positionX + this.halfWidth < leftBoundary;
  }

  public tryScore(birdX: number): boolean {
    if (this.hasScored) {
      return false;
    }

    if (birdX > this.positionX + this.halfWidth) {
      this.hasScored = true;
      return true;
    }

    return false;
  }

  private rebuildInstances(): void {
    const halfGap = this.gapSize * 0.5;
    const maxTopHeight = Math.max(this.worldHeight - (this.gapCenter + halfGap), 0);
    const maxBottomHeight = Math.max(this.gapCenter - halfGap, 0);

    this.writeInstanceMatrix(0, this.gapCenter + halfGap + maxTopHeight * 0.5, Math.max(maxTopHeight, 1));
    this.writeInstanceMatrix(1, this.gapCenter - halfGap - maxBottomHeight * 0.5, Math.max(maxBottomHeight, 1));

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  private writeInstanceMatrix(index: number, centerY: number, height: number): void {
    const matrix = TRANSFORM_MATRICES[index];
    TRANSFORM_QUATERNION.identity();
    TEMP_POSITION.set(this.positionX, centerY, this.positionZ);
    TEMP_SCALE.set(this.width, height, this.depth);

    matrix.compose(TEMP_POSITION, TRANSFORM_QUATERNION, TEMP_SCALE);
    this.mesh.setMatrixAt(index, matrix);

    const bounds = this.instanceBounds[index];
    bounds.copy(this.baseBounds).applyMatrix4(matrix);
  }
}
