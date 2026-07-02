// Two-finger pinch detection for zooming between views.
// onZoomOut fires when fingers pinch together, onZoomIn when they spread.
export function attachPinch(el, { onZoomOut, onZoomIn }) {
  let startDist = 0;

  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onStart = (e) => {
    if (e.touches.length === 2) startDist = dist(e.touches);
  };
  const onMove = (e) => {
    if (e.touches.length !== 2 || startDist === 0) return;
    const scale = dist(e.touches) / startDist;
    if (scale < 0.72 && onZoomOut) { startDist = 0; onZoomOut(); }
    else if (scale > 1.38 && onZoomIn) { startDist = 0; onZoomIn(); }
  };
  const onEnd = () => { startDist = 0; };

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: true });
  el.addEventListener('touchend', onEnd, { passive: true });
  return () => {
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
  };
}
