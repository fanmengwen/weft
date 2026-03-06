import { describe, expect, it } from 'vitest';
import { shouldStartEdgeWaypointEdit } from './edgeWaypointPolicy';

describe('edge waypoint policy', () => {
  it('requires canvas interactions and Alt to start waypoint editing', () => {
    expect(shouldStartEdgeWaypointEdit(false, { altKey: true })).toBe(false);
    expect(shouldStartEdgeWaypointEdit(true, { altKey: false })).toBe(false);
    expect(shouldStartEdgeWaypointEdit(true, { altKey: true })).toBe(true);
  });
});
