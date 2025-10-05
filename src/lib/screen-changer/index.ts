/**
 * Simple state machine for switching between registered screen controllers.
 *
 * Role
 * - Stores a map of screen implementations (intro screen, gameplay screen, etc.) that each expose
 *   `Update` and `Display` methods.
 * - Provides a `setState` method so the game loop can pivot between registered screens without
 *   tight coupling.
 *
 * Inputs & Outputs
 * - `register(name, classObject)`: associates an identifier with an `IScreenChangerObject`.
 * - `setState(state)`: selects which registered object receives subsequent `Update`/`Display`
 *   calls.
 *
 * Implementation Notes
 * - Throws if an unknown state is requested, making missing registrations easier to diagnose during
 *   development.
 */
export interface IScreenChangerObject {
  Update(): void;
  Display(context: CanvasRenderingContext2D): void;
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

  public Update(): void {
    const classObject = this.objects.get(this.currentState);

    if (classObject === void 0) {
      throw new TypeError(`State ${this.currentState} does not exists`);
    }

    classObject.Update();
  }

  public Display(context: CanvasRenderingContext2D): void {
    const classObject = this.objects.get(this.currentState);

    if (classObject === void 0) {
      throw new TypeError(`State ${this.currentState} does not exists`);
    }
    classObject.Display(context);
  }
}
