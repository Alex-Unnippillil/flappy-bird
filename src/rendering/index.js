/**
 * Draws the scrolling ground by iterating over the visible ground segments.
 * Accepts any object that exposes the `getSegments` method (e.g. the Ground
 * entity). Rendering the top highlight separately helps hide seams.
 */
export function drawGround(ctx, ground) {
  const segments = ground.getSegments();
  const baseColor = "#8B5A2B";
  const highlightColor = "#C68C53";
  const highlightHeight = Math.max(4, Math.floor(ground.getHeight() * 0.2));

  segments.forEach(({ x, y, width, height }) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = highlightColor;
    ctx.fillRect(x, y, width, highlightHeight);
  });
}
