import {
  DEFAULT_MEDALS,
  type HudState,
  type MedalDefinition,
  type MedalId,
  toMedalSet,
} from "../state";
import "../styles/medal-shelf.css";

function resolveRoot(root?: HTMLElement | string): HTMLElement {
  if (!root) {
    return document.createElement("div");
  }

  if (typeof root === "string") {
    const element = document.querySelector(root);
    if (!element) {
      throw new Error(`MedalShelf root selector \"${root}\" did not match an element.`);
    }
    if (!(element instanceof HTMLElement)) {
      throw new Error("MedalShelf root selector must resolve to an HTMLElement.");
    }
    return element;
  }

  return root;
}

function buildSlot(definition: MedalDefinition): {
  slot: HTMLElement;
  srLabel: HTMLSpanElement;
} {
  const slot = document.createElement("div");
  slot.className = "medal-shelf__slot";
  slot.dataset.medal = definition.id;
  slot.dataset.earned = "false";
  slot.setAttribute("role", "listitem");
  slot.setAttribute("aria-label", `${definition.label} locked`);

  const icon = document.createElement("span");
  icon.className = "medal-shelf__icon";
  icon.textContent = definition.icon;
  icon.setAttribute("aria-hidden", "true");

  const srLabel = document.createElement("span");
  srLabel.className = "medal-shelf__sr-label";
  srLabel.textContent = `${definition.label} locked`;

  slot.append(icon, srLabel);

  return { slot, srLabel };
}

export interface MedalShelfOptions {
  /**
   * Optional root element (or selector) to hydrate. When omitted the shelf will
   * create a new <div> container.
   */
  readonly root?: HTMLElement | string;
  /**
   * Overrides for the available medal definitions. Useful for testing or
   * themed experiences.
   */
  readonly medals?: readonly MedalDefinition[];
  /**
   * When provided, the element receives an aria-label describing the shelf.
   * Defaults to "Earned medals".
   */
  readonly label?: string;
}

export class MedalShelf {
  readonly #root: HTMLElement;
  readonly #definitions: readonly MedalDefinition[];
  readonly #slots: Map<MedalId, HTMLElement> = new Map();
  readonly #srLabels: Map<MedalId, HTMLSpanElement> = new Map();

  constructor(options: MedalShelfOptions = {}) {
    this.#root = resolveRoot(options.root);
    this.#definitions = options.medals ?? DEFAULT_MEDALS;

    this.#root.classList.add("medal-shelf");
    this.#root.setAttribute("role", "list");
    this.#root.setAttribute("aria-label", options.label ?? "Earned medals");

    const fragment = document.createDocumentFragment();
    for (const definition of this.#definitions) {
      const { slot, srLabel } = buildSlot(definition);
      fragment.append(slot);
      this.#slots.set(definition.id, slot);
      this.#srLabels.set(definition.id, srLabel);
    }

    this.#root.replaceChildren(fragment);
  }

  get element(): HTMLElement {
    return this.#root;
  }

  update(state: HudState | undefined): void {
    const medals = toMedalSet(state?.earnedMedals);

    for (const definition of this.#definitions) {
      const slot = this.#slots.get(definition.id);
      if (!slot) continue;

      const srLabel = this.#srLabels.get(definition.id);
      const isEarned = medals.has(definition.id);
      const earnedState = isEarned ? "true" : "false";

      if (slot.dataset.earned !== earnedState) {
        slot.dataset.earned = earnedState;
      }

      const statusText = `${definition.label} ${isEarned ? "earned" : "locked"}`;
      if (slot.getAttribute("aria-label") !== statusText) {
        slot.setAttribute("aria-label", statusText);
      }

      if (srLabel && srLabel.textContent !== statusText) {
        srLabel.textContent = statusText;
      }
    }
  }
}
