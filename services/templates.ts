import { Node, Edge, MarkerType } from 'reactflow';
import { NodeType } from '../types';
import { EDGE_STYLE, EDGE_LABEL_STYLE, EDGE_LABEL_BG_STYLE } from '../constants';
import { Layout, Database, Shield, Server, Mail, AlertTriangle, Play, FileText, CheckCircle } from 'lucide-react';

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon
  msg: string;
  nodes: Node[];
  edges: Edge[];
}

const createEdge = (source: string, target: string, label?: string) => ({
  id: `e-${source}-${target}-${Date.now()}`,
  source,
  target,
  label,
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  animated: true,
  style: EDGE_STYLE,
  labelStyle: EDGE_LABEL_STYLE,
  labelBgStyle: EDGE_LABEL_BG_STYLE,
  labelBgPadding: [8, 4] as [number, number],
  labelBgBorderRadius: 4,
});

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'auth-flow',
    name: 'Authentication Flow',
    description: 'Standard login with validation and 2FA check.',
    icon: Shield,
    msg: 'Auth Flow',
    nodes: [
      { id: 't-auth-1', type: NodeType.START, position: { x: 0, y: 0 }, data: { label: 'Login Request', subLabel: 'User submits creds', icon: 'User', color: 'blue' } },
      { id: 't-auth-2', type: NodeType.PROCESS, position: { x: 0, y: 150 }, data: { label: 'Validate Creds', subLabel: 'Check DB', icon: 'Database', color: 'slate' } },
      { id: 't-auth-3', type: NodeType.DECISION, position: { x: 0, y: 300 }, data: { label: 'Valid?', subLabel: 'Is password correct?', icon: 'Shield', color: 'amber' } },
      { id: 't-auth-4', type: NodeType.PROCESS, position: { x: 250, y: 400 }, data: { label: '2FA Check', subLabel: 'Send & Verify Code', icon: 'Mail', color: 'violet' } },
      { id: 't-auth-5', type: NodeType.END, position: { x: 0, y: 550 }, data: { label: 'Grant Access', subLabel: 'Generate Token', icon: 'CheckCircle', color: 'emerald' } },
      { id: 't-auth-6', type: NodeType.END, position: { x: -250, y: 400 }, data: { label: 'Deny Access', subLabel: 'Return 401', icon: 'AlertTriangle', color: 'red' } },
    ],
    edges: [
      createEdge('t-auth-1', 't-auth-2'),
      createEdge('t-auth-2', 't-auth-3'),
      createEdge('t-auth-3', 't-auth-4', 'Yes'),
      createEdge('t-auth-3', 't-auth-6', 'No'),
      createEdge('t-auth-4', 't-auth-5'),
    ]
  },
  {
    id: 'api-crud',
    name: 'API CRUD',
    description: 'Basic resource lifecycle: Create, Read, Update, Delete.',
    icon: Server,
    msg: 'CRUD Flow',
    nodes: [
      { id: 't-crud-1', type: NodeType.START, position: { x: 0, y: 0 }, data: { label: 'API Request', subLabel: 'GET / POST / PUT / DELETE', icon: 'Server', color: 'blue' } },
      { id: 't-crud-2', type: NodeType.DECISION, position: { x: 0, y: 150 }, data: { label: 'Method?', subLabel: 'Route request', icon: 'GitBranch', color: 'amber' } },
      { id: 't-crud-3', type: NodeType.PROCESS, position: { x: -300, y: 300 }, data: { label: 'Create', subLabel: 'Insert DB', icon: 'PlusCircle', color: 'emerald' } },
      { id: 't-crud-4', type: NodeType.PROCESS, position: { x: -100, y: 300 }, data: { label: 'Read', subLabel: 'Select DB', icon: 'Search', color: 'blue' } },
      { id: 't-crud-5', type: NodeType.PROCESS, position: { x: 100, y: 300 }, data: { label: 'Update', subLabel: 'Update DB', icon: 'Edit', color: 'fuchsia' } },
      { id: 't-crud-6', type: NodeType.PROCESS, position: { x: 300, y: 300 }, data: { label: 'Delete', subLabel: 'Remove DB', icon: 'Trash', color: 'red' } },
      { id: 't-crud-7', type: NodeType.END, position: { x: 0, y: 450 }, data: { label: 'Response', subLabel: 'Return JSON', icon: 'Code', color: 'slate' } },
    ],
    edges: [
      createEdge('t-crud-1', 't-crud-2'),
      createEdge('t-crud-2', 't-crud-3', 'POST'),
      createEdge('t-crud-2', 't-crud-4', 'GET'),
      createEdge('t-crud-2', 't-crud-5', 'PUT'),
      createEdge('t-crud-2', 't-crud-6', 'DELETE'),
      createEdge('t-crud-3', 't-crud-7'),
      createEdge('t-crud-4', 't-crud-7'),
      createEdge('t-crud-5', 't-crud-7'),
      createEdge('t-crud-6', 't-crud-7'),
    ]
  },
  {
    id: 'approval',
    name: 'Approval Workflow',
    description: 'Submit, review, and approve/reject process.',
    icon: FileText,
    msg: 'Approval Flow',
    nodes: [
      { id: 't-app-1', type: NodeType.START, position: { x: 0, y: 0 }, data: { label: 'Submit Request', subLabel: 'User submits form', icon: 'FileText', color: 'blue' } },
      { id: 't-app-2', type: NodeType.PROCESS, position: { x: 0, y: 150 }, data: { label: 'Manager Review', subLabel: 'Pending Approval', icon: 'User', color: 'yellow' } },
      { id: 't-app-3', type: NodeType.DECISION, position: { x: 0, y: 300 }, data: { label: 'Approved?', subLabel: 'Decision', icon: 'CheckSquare', color: 'amber' } },
      { id: 't-app-4', type: NodeType.PROCESS, position: { x: 200, y: 450 }, data: { label: 'Notify User', subLabel: 'Email: Approved', icon: 'Mail', color: 'emerald' } },
      { id: 't-app-5', type: NodeType.PROCESS, position: { x: -200, y: 450 }, data: { label: 'Request Changes', subLabel: 'Email: Feedback', icon: 'MessageSquare', color: 'red' } },
      { id: 't-app-6', type: NodeType.END, position: { x: 0, y: 600 }, data: { label: 'Complete', subLabel: 'Archive', icon: 'Archive', color: 'slate' } },
    ],
    edges: [
      createEdge('t-app-1', 't-app-2'),
      createEdge('t-app-2', 't-app-3'),
      createEdge('t-app-3', 't-app-4', 'Yes'),
      createEdge('t-app-3', 't-app-5', 'No'),
      createEdge('t-app-4', 't-app-6'),
      createEdge('t-app-5', 't-app-1', 'Resubmit'),
    ]
  }
];
