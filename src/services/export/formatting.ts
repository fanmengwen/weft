export function sanitizeLabel(label: string): string {
  return label.replace(/['"()]/g, '').trim() || 'Node';
}

export function sanitizeId(id: string): string {
  return id.replace(/[-]/g, '_');
}
