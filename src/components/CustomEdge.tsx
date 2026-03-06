import React from 'react';
import { useEdges, useNodes } from '@/lib/reactflowCompat';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import type { LegacyEdgeProps } from '@/lib/reactflowCompat';
import type { EdgeData } from '@/lib/types';
import { CustomEdgeWrapper } from './custom-edge/CustomEdgeWrapper';
import { buildEdgePath } from './custom-edge/pathUtils';
import { shouldUseOrthogonalRelationRouting } from './custom-edge/relationRoutingSemantics';

function createEdgeRenderer(variant: 'bezier' | 'smoothstep' | 'step') {
    return function RenderEdge(props: LegacyEdgeProps<EdgeData>): React.ReactElement {
        const allEdges = useEdges();
        const allNodes = useNodes();
        const relationSemanticsV1Enabled = ROLLOUT_FLAGS.relationSemanticsV1;
        const sourceNode = allNodes.find((node) => node.id === props.source);
        const targetNode = allNodes.find((node) => node.id === props.target);
        const forceOrthogonal = shouldUseOrthogonalRelationRouting(
            relationSemanticsV1Enabled,
            props.data,
            sourceNode,
            targetNode
        );
        const { edgePath, labelX, labelY } = buildEdgePath(
            {
                id: props.id,
                source: props.source,
                target: props.target,
                sourceX: props.sourceX,
                sourceY: props.sourceY,
                targetX: props.targetX,
                targetY: props.targetY,
                sourcePosition: props.sourcePosition,
                targetPosition: props.targetPosition,
                sourceHandleId: props.sourceHandleId,
                targetHandleId: props.targetHandleId,
            },
            allEdges,
            variant,
            {
                forceOrthogonal,
                waypoint: props.data?.waypoint as { x: number; y: number } | undefined,
            }
        );

        return (
            <CustomEdgeWrapper
                id={props.id}
                path={edgePath}
                labelX={labelX}
                labelY={labelY}
                markerEnd={props.markerEnd}
                style={props.style}
                data={props.data}
                label={props.label}
                markerStart={props.markerStart}
            />
        );
    };
}

export const CustomBezierEdge = createEdgeRenderer('bezier');
export const CustomSmoothStepEdge = createEdgeRenderer('smoothstep');
export const CustomStepEdge = createEdgeRenderer('step');

export default CustomSmoothStepEdge;
