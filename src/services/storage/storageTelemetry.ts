export type StorageTelemetrySeverity = 'info' | 'warning' | 'error';

export interface StorageTelemetryEvent {
  area: 'persist' | 'snapshot' | 'schema' | 'indexeddb-state';
  code: string;
  severity: StorageTelemetrySeverity;
  message: string;
}

type StorageTelemetryHandler = (event: StorageTelemetryEvent) => void;

let telemetryHandler: StorageTelemetryHandler | null = null;

export function setStorageTelemetryHandler(handler: StorageTelemetryHandler | null): void {
  telemetryHandler = handler;
}

export function reportStorageTelemetry(event: StorageTelemetryEvent): void {
  if (!telemetryHandler) return;
  try {
    telemetryHandler(event);
  } catch {
    // Telemetry is non-critical and must never break storage behavior.
  }
}
