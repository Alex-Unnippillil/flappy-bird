import { describe, expect, it } from "vitest";
import { BestScore } from "./BestScore";

describe("BestScore", () => {
  it("renders a placeholder before the first score is available", () => {
    const container = document.createElement("div");

    const component = new BestScore({ element: container, document });

    expect(component.element.textContent?.trim()).toBe("Best —");
    const delta = component.element.querySelector<HTMLElement>(".best-score__delta");
    expect(delta?.getAttribute("hidden")).toBe("true");
  });

  it("formats the delta when the best score improves", () => {
    const container = document.createElement("div");
    const component = new BestScore({ element: container, document });

    component.update(42);
    component.update(45);

    expect(component.element.textContent?.trim()).toBe("Best 45 (+3)");
    const delta = component.element.querySelector<HTMLElement>(".best-score__delta");
    expect(delta?.textContent).toBe(" (+3)");
  });
});
