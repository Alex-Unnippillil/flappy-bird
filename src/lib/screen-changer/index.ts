// File Overview: This module belongs to src/lib/screen-changer/index.ts.
export interface IScreenChangerObject {
  update(deltaMs: number): void;
  render(context: CanvasRenderingContext2D): void;
}

export default class ScreenChanger implements IScreenChangerObject {
  private objects: Map<string, IScreenChangerObject>;
  private currentState: string;

  constructor() {
    this.objects = new Map<string, IScreenChangerObject>();
    this.currentState = '';
  }

  public setState(state: string): void {
    this.currentState = state;
  }

  public register(name: string, classObject: IScreenChangerObject): void {
    this.objects.set(name, classObject);
  }

  public update(deltaMs: number): void {
    const classObject = this.objects.get(this.currentState);

    if (classObject === void 0) {
      throw new TypeError(`State ${this.currentState} does not exists`);
    }

    classObject.update(deltaMs);
  }

  public render(context: CanvasRenderingContext2D): void {
    const classObject = this.objects.get(this.currentState);

    if (classObject === void 0) {
      throw new TypeError(`State ${this.currentState} does not exists`);
    }
    classObject.render(context);
  }
}
