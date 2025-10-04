interface ImportMetaEnv {
  readonly BASE_URL?: string;
  readonly [key: string]: unknown;
}

declare interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
