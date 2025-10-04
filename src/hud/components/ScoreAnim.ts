import "../styles/score-anim.css";

export const SCORE_ANIM_CLASS = "score-anim";
export const SCORE_ANIM_ENTER_CLASS = "score-anim--enter";
export const SCORE_ANIM_VISIBLE_CLASS = "score-anim--entered";
const SCORE_ANIM_APPLIED_ATTR = "data-score-anim";

function scheduleFrame(callback: FrameRequestCallback) {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }

  globalThis.setTimeout(() => {
    callback(Date.now());
  }, 16);

  return 0;
}

export function applyScoreMountAnimation(target: Element | null) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.hasAttribute(SCORE_ANIM_APPLIED_ATTR)) {
    return;
  }

  target.setAttribute(SCORE_ANIM_APPLIED_ATTR, "true");
  target.classList.add(SCORE_ANIM_CLASS, SCORE_ANIM_ENTER_CLASS);

  scheduleFrame(() => {
    target.classList.remove(SCORE_ANIM_ENTER_CLASS);
    target.classList.add(SCORE_ANIM_VISIBLE_CLASS);
  });
}
