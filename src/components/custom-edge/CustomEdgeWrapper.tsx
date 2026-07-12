import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EdgeLabelRenderer, useReactFlow } from '@/lib/reactflowCompat';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import type { EdgeData, FlowEdge } from '@/lib/types';
import { resolveAnimatedEdgePresentation } from './animatedEdgePresentation';
import {
  buildEdgeLabelUpdates,
  getEditableEdgeLabel,
} from '@/components/properties/edge/edgeLabelModel';
import type { CinematicRenderState } from '@/services/export/cinematicRenderState';
import { resolveEdgeVisualStyle } from '@/theme';
import {
  buildDartArrowTransform,
  computePathEndpoint,
  DART_ARROW_PATH,
  EDGE_ARROW_TRIM_PX,
  shouldRenderDartMarker,
  type PathEndpoint,
} from './edgeDartArrow';

interface CustomEdgeWrapperProps {
  id: string;
  path: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  labelX: number;
  labelY: number;
  markerEnd?: string;
  markerEndConfig?: FlowEdge['markerEnd'];
  style?: React.CSSProperties;
  data?: EdgeData;
  label?: string | React.ReactNode;
  markerStart?: string;
  markerStartConfig?: FlowEdge['markerStart'];
  selected?: boolean;
  edgeAnimated?: boolean;
  cinematicExportState?: CinematicRenderState;
}

const EDGE_ACCENT_COLOR = 'var(--wf-acc)';

function toLabelTransform(x: number, y: number): string {
  return `translate(-50%, -50%) translate(${x}px,${y}px)`;
}

interface PathRenderMetrics {
  pathLength: number;
  end: PathEndpoint;
  start: PathEndpoint;
}

export const CustomEdgeWrapper = memo(function CustomEdgeWrapper({
  id,
  path,
  sourceX: _sourceX,
  sourceY: _sourceY,
  targetX: _targetX,
  targetY: _targetY,
  labelX,
  labelY,
  markerEnd: _markerEnd,
  markerEndConfig,
  style,
  data,
  label,
  markerStart: _markerStart,
  markerStartConfig,
  selected = false,
  edgeAnimated = false,
  cinematicExportState,
}: CustomEdgeWrapperProps): React.ReactElement {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const pathRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [pathMetrics, setPathMetrics] = useState<PathRenderMetrics | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');
  const designSystem = useDesignSystem();

  const beginLabelEdit = useCallback(() => {
    const current = getEditableEdgeLabel({
      id,
      source: '',
      target: '',
      data,
      label,
    } as FlowEdge);
    setLabelDraft(current);
    setIsEditingLabel(true);
  }, [data, id, label]);

  const commitLabelEdit = useCallback(() => {
    setEdges((edges) =>
      edges.map((e) =>
        e.id !== id ? e : { ...e, ...buildEdgeLabelUpdates(labelDraft) }
      )
    );
    setIsEditingLabel(false);
  }, [id, labelDraft, setEdges]);

  const cancelLabelEdit = useCallback(() => {
    setIsEditingLabel(false);
  }, []);

  const displayPath = path;
  const cinematicActive = Boolean(cinematicExportState?.active);
  const isBuiltCinematicEdge = Boolean(cinematicExportState?.builtEdgeIds.has(id));
  const isActiveCinematicEdge = cinematicExportState?.activeEdgeId === id;
  const cinematicEdgeProgress = isActiveCinematicEdge
    ? (cinematicExportState?.activeEdgeProgress ?? 0)
    : 0;
  const showCinematicLabel =
    isBuiltCinematicEdge || (isActiveCinematicEdge && cinematicEdgeProgress >= 0.85);

  const resolvedStyle = useMemo<React.CSSProperties>(
    () => ({
      stroke: designSystem.colors.edge,
      strokeWidth: designSystem.components.edge.strokeWidth,
      ...style,
    }),
    [designSystem.colors.edge, designSystem.components.edge.strokeWidth, style]
  );

  const showEndDart = shouldRenderDartMarker(
    typeof markerEndConfig === 'object' ? markerEndConfig : undefined
  );
  const showStartDart = shouldRenderDartMarker(
    typeof markerStartConfig === 'object' ? markerStartConfig : undefined
  );
  const edgeStrokeColor = String(resolvedStyle.stroke ?? designSystem.colors.edge);
  const edgeStrokeWidth = Number(
    resolvedStyle.strokeWidth ?? designSystem.components.edge.strokeWidth
  );
  const strokeColor = selected ? EDGE_ACCENT_COLOR : edgeStrokeColor;
  const strokeWidth = selected ? 2 : edgeStrokeWidth;
  const hasCustomDash = Boolean(resolvedStyle.strokeDasharray);
  const trimDasharray =
    !hasCustomDash &&
    pathMetrics &&
    pathMetrics.pathLength > EDGE_ARROW_TRIM_PX &&
    (showEndDart || showStartDart)
      ? `${pathMetrics.pathLength - EDGE_ARROW_TRIM_PX} ${EDGE_ARROW_TRIM_PX}`
      : undefined;
  const animatedPresentation = useMemo(
    () =>
      resolveAnimatedEdgePresentation({
        animatedExportEnabled: true,
        selected,
        hovered: isHovered,
        edgeAnimated,
        animationConfig: data?.animation,
        baseStyle: resolvedStyle,
      }),
    [data?.animation, edgeAnimated, isHovered, resolvedStyle, selected]
  );
  const edgeVisualStyle = useMemo(
    () => resolveEdgeVisualStyle(String(resolvedStyle.stroke ?? designSystem.colors.edge)),
    [designSystem.colors.edge, resolvedStyle.stroke]
  );

  useLayoutEffect(() => {
    const pathNode = pathRef.current;
    if (!pathNode || typeof pathNode.getTotalLength !== 'function') {
      return;
    }

    const pathLength = pathNode.getTotalLength();
    setPathMetrics({
      pathLength,
      end: computePathEndpoint(pathNode, 'end'),
      start: computePathEndpoint(pathNode, 'start'),
    });
  }, [displayPath]);

  useEffect(() => {
    const labelNode = labelRef.current;
    if (!labelNode) return;

    if (typeof data?.labelPosition !== 'number') {
      labelNode.style.transform = toLabelTransform(labelX, labelY);
      return;
    }

    const pathNode = pathRef.current;
    if (!pathNode) {
      labelNode.style.transform = toLabelTransform(labelX, labelY);
      return;
    }

    const length = pathNode.getTotalLength();
    const point = pathNode.getPointAtLength(length * data.labelPosition);
    labelNode.style.transform = toLabelTransform(point.x, point.y);
  }, [data?.labelPosition, labelX, labelY, path]);

  const updateEdgeData = (updater: (edgeData: EdgeData | undefined) => EdgeData): void => {
    setEdges((edges) => {
      return edges.map((edge) => {
        if (edge.id !== id) return edge;
        return {
          ...edge,
          data: updater(edge.data as EdgeData | undefined),
        };
      });
    });
  };

  const onLabelPointerDown = (event: React.PointerEvent): void => {
    event.stopPropagation();
    event.preventDefault();
    const pathNode = pathRef.current;
    if (!pathNode) return;

    const onPointerMove = (moveEvent: PointerEvent): void => {
      moveEvent.preventDefault();
      const flowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
      const pathLength = pathNode.getTotalLength();
      let bestLength = 0;
      let bestDistance = Infinity;

      for (let length = 0; length <= pathLength; length += 10) {
        const point = pathNode.getPointAtLength(length);
        const dx = point.x - flowPos.x;
        const dy = point.y - flowPos.y;
        const distance = dx * dx + dy * dy;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestLength = length;
        }
      }

      for (
        let length = Math.max(0, bestLength - 10);
        length <= Math.min(pathLength, bestLength + 10);
        length += 1
      ) {
        const point = pathNode.getPointAtLength(length);
        const dx = point.x - flowPos.x;
        const dy = point.y - flowPos.y;
        const distance = dx * dx + dy * dy;
        if (distance < bestDistance) {
          bestDistance = distance;
          bestLength = length;
        }
      }

      updateEdgeData((edgeData) => ({
        ...edgeData,
        labelPosition: bestLength / pathLength,
        labelOffsetX: 0,
        labelOffsetY: 0,
      }));
    };

    const onPointerUp = (upEvent: PointerEvent): void => {
      upEvent.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const hasArchitectureMeta =
    typeof data?.archProtocol === 'string' && data.archProtocol.length > 0;
  const direction = typeof data?.archDirection === 'string' ? data.archDirection : '-->';
  const directionGlyph = direction === '<--' ? '<-' : direction === '<-->' ? '<->' : '->';
  const sourceSide = typeof data?.archSourceSide === 'string' ? data.archSourceSide : '';
  const targetSide = typeof data?.archTargetSide === 'string' ? data.archTargetSide : '';
  const sideHint =
    sourceSide || targetSide ? `${sourceSide || '?'}${directionGlyph}${targetSide || '?'}` : '';
  const edgeLabel = getEditableEdgeLabel({
    id,
    source: '',
    target: '',
    data,
    label,
  } as FlowEdge);
  const renderedLabel = hasArchitectureMeta ? (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: edgeVisualStyle.metaBg,
        borderColor: edgeVisualStyle.metaBorder,
        color: edgeVisualStyle.metaText,
      }}
    >
      {sideHint && <span style={{ color: edgeVisualStyle.metaMutedText }}>{sideHint}</span>}
      <span>{data?.archProtocol}</span>
      {data?.archPort && <span style={{ color: edgeVisualStyle.metaMutedText }}>:{data.archPort}</span>}
    </span>
  ) : (
    edgeLabel
  );

  const shouldRenderInteractiveChrome = !cinematicActive;
  const shouldRenderBaseEdge = !cinematicActive || isBuiltCinematicEdge;
  const cinematicEdgeStyle: React.CSSProperties = {
    ...resolvedStyle,
    strokeDasharray: 1,
    strokeDashoffset: Math.max(0, 1 - cinematicEdgeProgress),
    strokeOpacity: 0.98,
  };
  const cinematicDartVisible = cinematicEdgeProgress >= 0.995;
  const cinematicGlowStyle: React.CSSProperties = {
    ...resolvedStyle,
    stroke: 'rgba(59,130,246,0.22)',
    strokeWidth: Number(resolvedStyle.strokeWidth ?? designSystem.components.edge.strokeWidth) + 4,
    strokeDasharray: 1,
    strokeDashoffset: Math.max(0, 1 - cinematicEdgeProgress),
  };

  const renderDartArrow = (
    side: 'start' | 'end',
    color: string,
    visible: boolean
  ): React.ReactElement | null => {
    if (!visible || !pathMetrics) {
      return null;
    }

    const endpoint = side === 'end' ? pathMetrics.end : pathMetrics.start;
    return (
      <path
        data-chart-edge-dart={side}
        d={DART_ARROW_PATH}
        fill={color}
        transform={buildDartArrowTransform(endpoint)}
        pointerEvents="none"
      />
    );
  };

  return (
    <>
      <path
        ref={pathRef}
        d={displayPath}
        fill="none"
        stroke="none"
        visibility="hidden"
        pointerEvents="none"
        aria-hidden="true"
      />
      {shouldRenderBaseEdge ? (
        <>
          {selected ? (
            <path
              data-chart-edge-glow="1"
              d={displayPath}
              fill="none"
              stroke={EDGE_ACCENT_COLOR}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.14}
              pointerEvents="none"
            />
          ) : null}
          <path
            data-chart-edge-main="1"
            d={displayPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={trimDasharray ?? resolvedStyle.strokeDasharray}
            style={
              trimDasharray
                ? undefined
                : {
                    strokeDasharray: resolvedStyle.strokeDasharray,
                    strokeDashoffset: resolvedStyle.strokeDashoffset,
                    strokeOpacity: resolvedStyle.strokeOpacity,
                  }
            }
          />
          {renderDartArrow('end', strokeColor, showEndDart)}
          {renderDartArrow('start', strokeColor, showStartDart)}
        </>
      ) : null}
      {cinematicActive && isActiveCinematicEdge ? (
        <>
          <path
            d={displayPath}
            pathLength={1}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
            style={cinematicGlowStyle}
          />
          <path
            d={displayPath}
            pathLength={1}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={cinematicEdgeStyle}
          />
          {cinematicDartVisible ? (
            <>
              {renderDartArrow('end', edgeStrokeColor, showEndDart)}
              {renderDartArrow('start', edgeStrokeColor, showStartDart)}
            </>
          ) : null}
        </>
      ) : null}
      {animatedPresentation.shouldRenderOverlay && !cinematicActive && (
        <path
          d={displayPath}
          fill="none"
          strokeLinecap="round"
          style={animatedPresentation.overlayStyle}
          className="flow-edge-animated-overlay"
          pointerEvents="none"
          aria-hidden="true"
        />
      )}
      {shouldRenderInteractiveChrome ? (
        <path
          d={displayPath}
          fill="none"
          stroke="rgba(15,23,42,0.001)"
          strokeWidth={20}
          pointerEvents="stroke"
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onDoubleClick={(event) => {
            event.stopPropagation();
            beginLabelEdit();
          }}
          aria-hidden="true"
        >
          <title>Select edge</title>
        </path>
      ) : null}
      {((renderedLabel && (!cinematicActive || showCinematicLabel)) ||
        (!cinematicActive && !hasArchitectureMeta && (selected || isHovered))) && (
        <EdgeLabelRenderer>
          <div
            ref={labelRef}
            style={{
              position: 'absolute',
              transform: toLabelTransform(labelX, labelY),
              fontSize: 12,
              pointerEvents: 'all',
            }}
            onPointerEnter={() => {
              if (!cinematicActive) setIsHovered(true);
            }}
            onPointerLeave={() => {
              if (!cinematicActive) setIsHovered(false);
            }}
            className={`flow-edge-label nodrag nopan ${selected || isHovered ? 'flow-lod-preserve' : ''}`}
          >
            {isEditingLabel ? (
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={commitLabelEdit}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitLabelEdit();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelLabelEdit();
                  }
                }}
                className="min-w-[60px] rounded-full border border-indigo-400 bg-[var(--brand-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand-text)] shadow-sm outline-none ring-2 ring-indigo-300/50"
                style={{
                  borderColor: edgeVisualStyle.pillHoverBorder,
                  backgroundColor: 'var(--brand-surface)',
                  color: 'var(--brand-text)',
                  boxShadow: `0 0 0 2px ${edgeVisualStyle.focusRing}`,
                }}
              />
            ) : renderedLabel ? (
              <div
                data-chart-edge-label-pill="1"
                onPointerDown={onLabelPointerDown}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  beginLabelEdit();
                }}
                className={`whitespace-nowrap border select-none flow-lod-secondary flow-lod-shadow transition-all ${cinematicActive ? 'shadow-[0_6px_18px_rgba(15,23,42,0.08)]' : 'hover:shadow'}`}
                style={{
                  backgroundColor: cinematicActive ? 'var(--brand-surface)' : '#FFFFFF',
                  border: cinematicActive ? '1px solid var(--color-brand-border)' : '1px solid #E6E8EC',
                  borderColor: cinematicActive
                    ? 'var(--color-brand-border)'
                    : selected
                      ? EDGE_ACCENT_COLOR
                      : '#E6E8EC',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: cinematicActive
                    ? 'var(--brand-secondary)'
                    : selected
                      ? EDGE_ACCENT_COLOR
                      : '#5C6572',
                  boxShadow: !cinematicActive && selected
                    ? `0 0 0 2px ${edgeVisualStyle.focusRing}`
                    : undefined,
                }}
              >
                {renderedLabel}
              </div>
            ) : (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  beginLabelEdit();
                }}
                className="rounded-full border border-dashed bg-[var(--brand-surface)]/95 px-2.5 py-0.5 text-[11px] font-medium shadow-sm transition-colors"
                style={{
                  borderColor: edgeVisualStyle.pillBorder,
                  color: edgeVisualStyle.pillText,
                }}
              >
                Add label
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
