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
 * - Optional input callback for update notifications.
 * - Emits a `flappybird:sw-update-available` window event and shows a lightweight refresh banner
 *   when an update is installed and waiting while an existing controller is active.
 *
 * Implementation Notes
 * - Keeps the implementation minimal because webpack injects the worker path and Workbox handles
 *   runtime caching configuration.
 */
const SW_UPDATE_EVENT = 'flappybird:sw-update-available';

const createUpdateBanner = () => {
  if (document.getElementById('sw-update-banner')) return;

  const banner = document.createElement('div');
  const message = document.createElement('span');
  const refreshButton = document.createElement('button');

  banner.id = 'sw-update-banner';
  message.textContent = 'Update available.';
  refreshButton.type = 'button';
  refreshButton.textContent = 'Refresh';

  refreshButton.addEventListener('click', () => {
    window.location.reload();
  });

  banner.append(message, refreshButton);
  document.body.appendChild(banner);
};

const emitUpdateAvailable = (registration: ServiceWorkerRegistration) => {
  window.dispatchEvent(
    new CustomEvent(SW_UPDATE_EVENT, {
      detail: {
        registration,
      },
    }),
  );

  createUpdateBanner();
};

export default (onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void) => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
          console.log('SW registered', registration.scope);

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                emitUpdateAvailable(registration);
                onUpdateAvailable?.(registration);
              }
            });
          });
        })
        .catch((err: unknown) => {
          console.error('SW registration failed:', err);
        });
    });
  }
};

export { SW_UPDATE_EVENT };
