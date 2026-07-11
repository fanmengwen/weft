import type { CSSProperties } from 'react';
import type { DesignSystem } from '@/lib/types';
import { FONT_FAMILY_MAP, fontSizeClassFor } from './nodeHelpers';
import { getMermaidImportedFontSize } from './customNodeMermaidHelpers';
import type { NodeExportColor } from '@/theme/types';

interface BuildCustomNodeTypographyOptions {
  data: {
    label?: string;
    subLabel?: string;
    fontFamily?: string;
    subLabelFontFamily?: string;
    fontSize?: string;
    subLabelFontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    subLabelFontWeight?: string;
    subLabelFontStyle?: string;
    align?: string;
  };
  designSystem: DesignSystem;
  visualStyle: NodeExportColor;
  surfaceVariant: 'stadium' | 'rounded' | null;
  isMermaidImportedLeaf: boolean;
  nodeHeightPx: number | undefined;
}

export function buildCustomNodeTypography(options: BuildCustomNodeTypographyOptions): {
  textProps: CSSProperties;
  subTextProps: CSSProperties;
  textAlignStyle: CSSProperties;
  fSizeClass: string;
  subLabelSizeClass: string;
  labelFontFamilyClass: string;
  subLabelFontFamilyClass: string;
  labelFontFamilyStyle: CSSProperties;
} {
  const {
    data,
    designSystem,
    visualStyle,
    surfaceVariant,
    isMermaidImportedLeaf,
    nodeHeightPx,
  } = options;

  const labelFontFamilyClass = data.fontFamily ? FONT_FAMILY_MAP[data.fontFamily] : '';
  const labelFontFamilyStyle = !data.fontFamily
    ? { fontFamily: designSystem.typography.fontFamily }
    : {};
  const subLabelFontFamily = data.subLabelFontFamily || data.fontFamily;
  const subLabelFontFamilyClass = subLabelFontFamily ? FONT_FAMILY_MAP[subLabelFontFamily] : '';
  const subLabelFontFamilyStyle = !subLabelFontFamily
    ? { fontFamily: designSystem.typography.fontFamily }
    : {};
  const fontSize = data.fontSize || '13';
  const isNumericSize = !isNaN(Number(fontSize));
  const fSizeClass = fontSizeClassFor(fontSize);
  const fontSizeStyle = isNumericSize ? { fontSize: `${fontSize}px` } : {};
  const subLabelFontSize = data.subLabelFontSize || '10';
  const subLabelIsNumericSize = !isNaN(Number(subLabelFontSize));
  const subLabelSizeClass = fontSizeClassFor(subLabelFontSize);
  const subLabelFontSizeStyle = subLabelIsNumericSize ? { fontSize: `${subLabelFontSize}px` } : {};

  const importedFontFamilyStyle =
    isMermaidImportedLeaf && !data.fontFamily
      ? { fontFamily: designSystem.typography.fontFamily }
      : {};
  const importedFontSizeStyle =
    !data.fontSize && isMermaidImportedLeaf
      ? { fontSize: `${getMermaidImportedFontSize(nodeHeightPx)}px` }
      : {};

  const textProps = surfaceVariant
    ? {
        ...labelFontFamilyStyle,
        ...importedFontFamilyStyle,
        color: designSystem.colors.nodeText,
        fontSize: surfaceVariant === 'stadium' ? '13px' : '13.5px',
        fontWeight: data.fontWeight || '600',
        fontStyle: data.fontStyle || 'normal',
        lineHeight: 1.2,
      }
    : {
        ...fontSizeStyle,
        ...importedFontSizeStyle,
        ...labelFontFamilyStyle,
        ...importedFontFamilyStyle,
        color: visualStyle.text,
        fontWeight: data.fontWeight || (isMermaidImportedLeaf ? '500' : '600'),
        fontStyle: data.fontStyle || 'normal',
        lineHeight: isMermaidImportedLeaf ? 1.1 : 1.2,
      };

  const labelTextAlign = (data.align || 'center') as CSSProperties['textAlign'];
  const subTextProps = surfaceVariant
    ? {
        ...subLabelFontFamilyStyle,
        color: '#8B93A0',
        fontSize: '11px',
        fontWeight: data.subLabelFontWeight || 'normal',
        fontStyle: data.subLabelFontStyle || 'normal',
        textAlign: labelTextAlign,
        lineHeight: 1.25,
      }
    : {
        ...subLabelFontSizeStyle,
        ...subLabelFontFamilyStyle,
        color: visualStyle.subText,
        fontWeight: data.subLabelFontWeight || 'normal',
        fontStyle: data.subLabelFontStyle || 'normal',
        textAlign: labelTextAlign,
        opacity: 0.85,
        lineHeight: 1.25,
      };

  return {
    textProps,
    subTextProps,
    textAlignStyle: { textAlign: labelTextAlign },
    fSizeClass,
    subLabelSizeClass,
    labelFontFamilyClass,
    subLabelFontFamilyClass,
    labelFontFamilyStyle,
  };
}
