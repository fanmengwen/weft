export function shouldStartEdgeWaypointEdit(
  canvasInteractionsEnabled: boolean,
  event: { altKey?: boolean }
): boolean {
  return canvasInteractionsEnabled && Boolean(event.altKey);
}
