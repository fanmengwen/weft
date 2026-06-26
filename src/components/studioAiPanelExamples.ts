import { ClipboardCheck, GitBranch, Layers, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AIStudioExampleDefinition {
  labelKey: string;
  promptKey: string;
  icon: LucideIcon;
}

export const EMPTY_CANVAS_EXAMPLE_DEFINITIONS: AIStudioExampleDefinition[] = [
  {
    labelKey: 'commandBar.aiStudio.examples.userRegistrationFlow',
    promptKey: 'commandBar.aiStudio.examples.userRegistrationFlowPrompt',
    icon: UserPlus,
  },
  {
    labelKey: 'commandBar.aiStudio.examples.contentReviewWorkflow',
    promptKey: 'commandBar.aiStudio.examples.contentReviewWorkflowPrompt',
    icon: ClipboardCheck,
  },
  {
    labelKey: 'commandBar.aiStudio.examples.dataProcessingPipeline',
    promptKey: 'commandBar.aiStudio.examples.dataProcessingPipelinePrompt',
    icon: Layers,
  },
  {
    labelKey: 'commandBar.aiStudio.examples.approvalWorkflow',
    promptKey: 'commandBar.aiStudio.examples.approvalWorkflowPrompt',
    icon: GitBranch,
  },
];

export interface AIStudioExample {
  label: string;
  icon: LucideIcon;
  prompt: string;
}

export const ITERATION_EXAMPLE_DEFINITIONS: AIStudioExampleDefinition[] = [
  {
    labelKey: 'commandBar.aiStudio.examples.iterationDatabase',
    promptKey: 'commandBar.aiStudio.examples.iterationDatabasePrompt',
    icon: Layers,
  },
  {
    labelKey: 'commandBar.aiStudio.examples.iterationServer',
    promptKey: 'commandBar.aiStudio.examples.iterationServerPrompt',
    icon: GitBranch,
  },
  {
    labelKey: 'commandBar.aiStudio.examples.iterationDeploy',
    promptKey: 'commandBar.aiStudio.examples.iterationDeployPrompt',
    icon: ClipboardCheck,
  },
];

export const EXAMPLE_ICON_COLORS = [
  'text-orange-500',
  'text-blue-500',
  'text-amber-500',
  'text-indigo-500',
  'text-teal-500',
  'text-rose-500',
];
