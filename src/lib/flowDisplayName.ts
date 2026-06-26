export const DEFAULT_FLOW_NAME = 'Untitled Flow';

type TranslateFlowName = (
  key: string,
  options?: { defaultValue?: string }
) => string;

export function isDefaultFlowName(name: string | null | undefined): boolean {
  return (name ?? '').trim() === DEFAULT_FLOW_NAME;
}

export function getFlowDisplayName(
  name: string | null | undefined,
  t: TranslateFlowName
): string {
  if (!name?.trim()) {
    return t('editor.untitled', { defaultValue: DEFAULT_FLOW_NAME });
  }

  if (isDefaultFlowName(name)) {
    return t('editor.untitled', { defaultValue: DEFAULT_FLOW_NAME });
  }

  return name;
}
