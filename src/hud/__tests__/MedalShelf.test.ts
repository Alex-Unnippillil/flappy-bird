import { describe, expect, it } from "vitest";
import { MedalShelf } from "../components/MedalShelf";
import { DEFAULT_MEDALS, type HudState, type MedalId } from "../state";

function createState(medals: readonly MedalId[] = []): HudState {
  return { earnedMedals: medals };
}

function getSlots(shelf: MedalShelf) {
  return Array.from(shelf.element.querySelectorAll<HTMLElement>(".medal-shelf__slot"));
}

describe("MedalShelf", () => {
  it("renders the full complement of medal slots", () => {
    const shelf = new MedalShelf();

    const slots = getSlots(shelf);
    expect(slots).toHaveLength(DEFAULT_MEDALS.length);
    expect(shelf.element.getAttribute("role")).toBe("list");

    slots.forEach((slot, index) => {
      expect(slot.dataset.medal).toBe(DEFAULT_MEDALS[index]?.id);
      expect(slot.dataset.earned).toBe("false");
    });
  });

  it("only toggles attributes when medals are earned, avoiding layout shifts", () => {
    const shelf = new MedalShelf();
    const originalSlots = getSlots(shelf);

    // Capture node references and markup so we can ensure structural stability.
    const originalNodes = [...originalSlots];
    const originalIcons = originalSlots.map((slot) =>
      slot.querySelector<HTMLElement>(".medal-shelf__icon")
    );
    const originalLabels = originalSlots.map((slot) =>
      slot.querySelector<HTMLElement>(".medal-shelf__sr-label")
    );

    shelf.update(createState(["bronze", "silver"]));
    shelf.update(createState(["bronze", "silver", "gold"]));

    const updatedSlots = getSlots(shelf);
    expect(updatedSlots).toHaveLength(originalSlots.length);

    updatedSlots.forEach((slot, index) => {
      expect(slot).toBe(originalNodes[index]);
      const icon = slot.querySelector(".medal-shelf__icon");
      const label = slot.querySelector(".medal-shelf__sr-label");

      expect(icon).toBe(originalIcons[index]);
      expect(label).toBe(originalLabels[index]);
    });
  });

  it("reflects medal status through accessibility attributes", () => {
    const shelf = new MedalShelf();

    shelf.update(createState(["gold"]));

    const slots = getSlots(shelf);
    const goldSlot = slots.find((slot) => slot.dataset.medal === "gold");
    const bronzeSlot = slots.find((slot) => slot.dataset.medal === "bronze");

    expect(goldSlot?.dataset.earned).toBe("true");
    expect(goldSlot?.getAttribute("aria-label")).toBe("Gold medal earned");

    expect(bronzeSlot?.dataset.earned).toBe("false");
    expect(bronzeSlot?.getAttribute("aria-label")).toBe("Bronze medal locked");
  });
});
