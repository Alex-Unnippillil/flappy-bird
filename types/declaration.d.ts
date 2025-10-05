// Supplies module shims for importing compiled assets and a legacy WebKit MutationObserver global for browser compatibility.
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.ogg' {
  const value: string;
  export default value;
}

declare module '*.scss';
declare module '*.sass';
declare module '*.css';

declare let WebKitMutationObserver: MutationObserver;

// Keep additional ambient modules grouped by asset type and default export shape to align with existing consumption patterns.
