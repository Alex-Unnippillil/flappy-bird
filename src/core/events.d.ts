declare global {
  interface GameEvents {}
}

export type GameEventName = keyof GameEvents & string;
