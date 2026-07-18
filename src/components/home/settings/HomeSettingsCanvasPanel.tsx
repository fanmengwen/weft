import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFlowStore } from '@/store';
import { useViewSettings, useVisualSettingsActions } from '@/store/viewHooks';
import {
  SettingsCard,
  SettingsFieldHint,
  SettingsFieldTitle,
  SettingsSection,
  SettingsSegmentedControl,
  SettingsToggle,
} from './settingsPrimitives';

type EdgePreset = 'curve' | 'ortho';

export function HomeSettingsCanvasPanel(): React.ReactElement {
  const { t } = useTranslation();
  const viewSettings = useViewSettings();
  const globalEdgeOptions = useFlowStore((state) => state.globalEdgeOptions);
  const { toggleGrid, toggleSnap, setGlobalEdgeOptions } = useVisualSettingsActions();

  const edgePreset: EdgePreset =
    globalEdgeOptions.curve === 'step' || globalEdgeOptions.type === 'step' ? 'ortho' : 'curve';

  function setEdgePreset(preset: EdgePreset): void {
    if (preset === 'curve') {
      setGlobalEdgeOptions({ type: 'bezier', curve: 'basis' });
      return;
    }
    setGlobalEdgeOptions({ type: 'step', curve: 'step' });
  }

  return (
    <SettingsCard>
      <SettingsSection className="flex items-center justify-between gap-4">
        <div>
          <SettingsFieldTitle>
            {t('homeSettings.canvas.showGrid', 'Show grid dots')}
          </SettingsFieldTitle>
          <SettingsFieldHint>
            {t('homeSettings.canvas.showGridDesc', '22px dot grid on the canvas background')}
          </SettingsFieldHint>
        </div>
        <SettingsToggle
          checked={viewSettings.showGrid}
          onChange={() => toggleGrid()}
          label={t('homeSettings.canvas.showGrid', 'Show grid dots')}
        />
      </SettingsSection>

      <SettingsSection bordered className="flex items-center justify-between gap-4">
        <div>
          <SettingsFieldTitle>{t('homeSettings.canvas.snap', 'Snap to align')}</SettingsFieldTitle>
          <SettingsFieldHint>
            {t(
              'homeSettings.canvas.snapDesc',
              'Snap nodes to the grid and nearby nodes while dragging'
            )}
          </SettingsFieldHint>
        </div>
        <SettingsToggle
          checked={viewSettings.snapToGrid}
          onChange={() => toggleSnap()}
          label={t('homeSettings.canvas.snap', 'Snap to align')}
        />
      </SettingsSection>

      <SettingsSection bordered>
        <SettingsFieldTitle>
          {t('homeSettings.canvas.edgeStyle', 'Edge style')}
        </SettingsFieldTitle>
        <SettingsFieldHint>
          {t(
            'homeSettings.canvas.edgeStyleDesc',
            'Default soft curves, matching the element style guide'
          )}
        </SettingsFieldHint>
        <SettingsSegmentedControl
          value={edgePreset}
          onChange={setEdgePreset}
          options={[
            {
              value: 'curve',
              label: t('homeSettings.canvas.edgeCurve', 'Soft curve'),
            },
            {
              value: 'ortho',
              label: t('homeSettings.canvas.edgeOrtho', 'Orthogonal'),
            },
          ]}
        />
      </SettingsSection>
    </SettingsCard>
  );
}
