import { hudEventBus, type ScoreEvent } from "../events";
import { formatScore } from "../utils/formatScore";

export interface ScoreController {
  /** Root element containing the rendered score. */
  readonly element: HTMLElement;
  /**
   * Remove the component from the DOM and unsubscribe from HUD events.
   * Safe to call multiple times.
   */
  destroy(): void;
}

function createScoreElement(initialScore: number): {
  element: HTMLElement;
  textNode: Text;
} {
  const element = document.createElement("span");
  element.className = "hud-score";

  const textNode = document.createTextNode(formatScore(initialScore));
  element.append(textNode);

  return { element, textNode };
}

function scheduleUpdate(textNode: Text, event: ScoreEvent): void {
  // Update the text node directly to avoid layout reflows. This ensures the
  // HUD stays responsive without triggering expensive DOM work.
  textNode.nodeValue = formatScore(event.value);
}

export const Score = {
  mount(container: HTMLElement): ScoreController {
    const { element, textNode } = createScoreElement(0);

    container.replaceChildren(element);

    const unsubscribe = hudEventBus.on("score", (event) => {
      scheduleUpdate(textNode, event);
    });

    let destroyed = false;

    return {
      element,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        unsubscribe();
        if (element.parentElement === container) {
          container.removeChild(element);
        }
      },
    };
  },
};

export function teardownScore(controller: ScoreController | null | undefined): void {
  controller?.destroy();
}
