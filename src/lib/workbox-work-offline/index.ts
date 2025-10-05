/**
 * Registers the Workbox-generated service worker in production builds.
 *
 * Role
 * - Guards the registration call with feature detection and defers execution until `window.load`
 *   so webpack's generated worker can precache assets for offline usage.
 * - Lives alongside Webpack's Workbox plugin output and is imported by the app entry during
 *   production.
 *
 * Inputs & Outputs
 * - No inputs; executing the default export attaches an event listener and returns `void`.
 * - Logs registration success or failure to the console for diagnostics.
 *
 * Implementation Notes
 * - Keeps the implementation minimal because webpack injects the worker path and Workbox handles
 *   runtime caching configuration.
 */
export default () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then(() => {
          console.log('SW registered');
        })
        .catch(() => {
          console.log('SW registration failed');
        });
    });
  }
};
