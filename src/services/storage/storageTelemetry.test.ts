import { describe, expect, it, vi } from 'vitest';
import {
  reportStorageTelemetry,
  setStorageTelemetryHandler,
  type StorageTelemetryEvent,
} from './storageTelemetry';

describe('storageTelemetry', () => {
  it('forwards events to registered handler', () => {
    const handler = vi.fn();
    setStorageTelemetryHandler(handler);

    const event: StorageTelemetryEvent = {
      area: 'persist',
      code: 'TEST',
      severity: 'info',
      message: 'test message',
    };
    reportStorageTelemetry(event);

    expect(handler).toHaveBeenCalledWith(event);
    setStorageTelemetryHandler(null);
  });

  it('never throws when handler throws', () => {
    setStorageTelemetryHandler(() => {
      throw new Error('telemetry boom');
    });

    expect(() => {
      reportStorageTelemetry({
        area: 'schema',
        code: 'THROW',
        severity: 'warning',
        message: 'throw test',
      });
    }).not.toThrow();
    setStorageTelemetryHandler(null);
  });
});
