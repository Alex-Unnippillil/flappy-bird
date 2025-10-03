import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const stylesPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../styles.css"
);

function loadHudFontSmoothingBlock() {
  const css = readFileSync(stylesPath, "utf8");
  const startToken = "/* hud-font-smoothing:start */";
  const endToken = "/* hud-font-smoothing:end */";
  const start = css.indexOf(startToken);
  const end = css.indexOf(endToken);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("HUD font smoothing block not found in styles.css");
  }

  return css.slice(start + startToken.length, end).trim();
}

describe("HUD font smoothing", () => {
  it("targets the intended density range with consistent declarations", () => {
    const block = loadHudFontSmoothingBlock();

    const mediaMatch = block.match(/@media\s*\(([^)]+)\)\s*and\s*\(([^)]+)\)\s*\{([\s\S]+)\}$/);
    expect(mediaMatch).not.toBeNull();
    if (!mediaMatch) return;

    const [, minClause, maxClause, inner] = mediaMatch;

    const minMatch = minClause.match(/min-resolution:\s*([\d.]+)dppx/i);
    const maxMatch = maxClause.match(/max-resolution:\s*([\d.]+)dppx/i);

    expect(minMatch).not.toBeNull();
    expect(maxMatch).not.toBeNull();
    if (!minMatch || !maxMatch) return;

    const min = parseFloat(minMatch[1]);
    const max = parseFloat(maxMatch[1]);

    const selectorsMatch = inner.match(/([^{}]+)\{([\s\S]+)\}\s*$/);
    expect(selectorsMatch).not.toBeNull();
    if (!selectorsMatch) return;

    const [ , selectorsSource, declarationsSource ] = selectorsMatch;

    const selectors = selectorsSource
      .split(",")
      .map((selector) => selector.trim())
      .filter(Boolean);

    const declarations = Object.fromEntries(
      Array.from(declarationsSource.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)).map(([, property, value]) => [
        property,
        value.trim(),
      ])
    );

    const samples = [1, 1.25, 1.5, 2, 2.75, 3, 3.5];
    const coverage = samples.map((dpr) => ({
      dpr,
      matches: dpr >= min && dpr <= max,
      declarations: dpr >= min && dpr <= max ? declarations : {},
    }));

    const summary = {
      coverage,
      declarations,
      media: { min, max },
      raw: block,
      selectors,
    };

    expect(summary).toMatchInlineSnapshot(`
      {
        "coverage": [
          {
            "declarations": {},
            "dpr": 1,
            "matches": false,
          },
          {
            "declarations": {
              "-moz-osx-font-smoothing": "grayscale",
              "-webkit-font-smoothing": "antialiased",
              "text-rendering": "optimizeLegibility",
            },
            "dpr": 1.25,
            "matches": true,
          },
          {
            "declarations": {
              "-moz-osx-font-smoothing": "grayscale",
              "-webkit-font-smoothing": "antialiased",
              "text-rendering": "optimizeLegibility",
            },
            "dpr": 1.5,
            "matches": true,
          },
          {
            "declarations": {
              "-moz-osx-font-smoothing": "grayscale",
              "-webkit-font-smoothing": "antialiased",
              "text-rendering": "optimizeLegibility",
            },
            "dpr": 2,
            "matches": true,
          },
          {
            "declarations": {
              "-moz-osx-font-smoothing": "grayscale",
              "-webkit-font-smoothing": "antialiased",
              "text-rendering": "optimizeLegibility",
            },
            "dpr": 2.75,
            "matches": true,
          },
          {
            "declarations": {
              "-moz-osx-font-smoothing": "grayscale",
              "-webkit-font-smoothing": "antialiased",
              "text-rendering": "optimizeLegibility",
            },
            "dpr": 3,
            "matches": true,
          },
          {
            "declarations": {},
            "dpr": 3.5,
            "matches": false,
          },
        ],
        "declarations": {
          "-moz-osx-font-smoothing": "grayscale",
          "-webkit-font-smoothing": "antialiased",
          "text-rendering": "optimizeLegibility",
        },
        "media": {
          "max": 3,
          "min": 1.25,
        },
        "raw": "@media (min-resolution: 1.25dppx) and (max-resolution: 3dppx) {\n  .hud-panel,\n  .hud-panel * {\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    text-rendering: optimizeLegibility;\n  }\n}",
        "selectors": [
          ".hud-panel",
          ".hud-panel *",
        ],
      }
    `);
  });
});
