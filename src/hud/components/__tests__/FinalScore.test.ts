import { describe, expect, it } from "vitest";
import { FinalScore } from "../FinalScore";
import { formatScore } from "../../formatScore";

describe("formatScore", () => {
  it("adds thousands separators for large scores", () => {
    expect(formatScore(1234567)).toMatchInlineSnapshot('"1,234,567"');
  });

  it("clamps negative and non-finite values to zero", () => {
    expect(formatScore(-42)).toMatchInlineSnapshot('"0"');
    expect(formatScore(Number.NaN)).toMatchInlineSnapshot('"0"');
    expect(formatScore(Number.POSITIVE_INFINITY)).toMatchInlineSnapshot('"0"');
  });
});

describe("FinalScore", () => {
  it("renders formatted metrics", () => {
    const view = new FinalScore();
    view.setScores(987654, 1234567);
    view.show();

    expect(view.element.outerHTML).toMatchInlineSnapshot(`
      "<section class=\"final-score\" role=\"status\" aria-live=\"polite\"><h2 class=\"final-score__title\">Final score</h2><div class=\"final-score__metrics\"><div class=\"final-score__metric\"><span class=\"final-score__label\">Score</span><span class=\"final-score__value\">987,654</span></div><div class=\"final-score__metric\"><span class=\"final-score__label\">Best</span><span class=\"final-score__value\">1,234,567</span></div></div><span class=\"final-score__badge\" role=\"note\" hidden=\"\">New personal best!</span></section>"
    `);
  });

  it("highlights new personal bests", () => {
    const view = new FinalScore();
    view.setScores(2222, 2222, { isRecord: true });
    view.show();

    expect(view.element.outerHTML).toMatchInlineSnapshot(`
      "<section class=\"final-score final-score--record\" role=\"status\" aria-live=\"polite\"><h2 class=\"final-score__title\">Final score</h2><div class=\"final-score__metrics\"><div class=\"final-score__metric\"><span class=\"final-score__label\">Score</span><span class=\"final-score__value\">2,222</span></div><div class=\"final-score__metric\"><span class=\"final-score__label\">Best</span><span class=\"final-score__value\">2,222</span></div></div><span class=\"final-score__badge\" role=\"note\">New personal best!</span></section>"
    `);
  });
});
