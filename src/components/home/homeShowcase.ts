import type { DocumentKind } from './documentKindStorage';

export interface HomeExampleCard {
  id: string;
  kind: DocumentKind;
  /** i18n key under home.examples.* */
  titleKey: string;
  actionKey: string;
  /** Chart demos open a featured template; workflow demos open blank workflow. */
  templateId?: string;
}

export interface HomeShowcaseTemplate {
  id: string;
  kind: DocumentKind;
  /** i18n key under home.showcase.* */
  titleKey: string;
  /** Short subtitle under the title (design list row). */
  descriptionKey: string;
  /** Opens this flowchart template when kind is chart. */
  templateId?: string;
}

/** First-run demos — mapped onto product-real entry points. */
export const HOME_EXAMPLE_CARDS: readonly HomeExampleCard[] = [
  {
    id: 'leave-approval',
    kind: 'chart',
    titleKey: 'home.examples.leaveApproval',
    actionKey: 'home.examples.openLook',
    templateId: 'leave-approval-flow',
  },
  {
    id: 'online-hot-brief',
    kind: 'workflow',
    titleKey: 'home.examples.webSummaryBot',
    actionKey: 'home.examples.runOnce',
    templateId: 'online-hot-brief',
  },
];

/** Compact template strip / new-user template groups (design order). */
export const HOME_SHOWCASE_TEMPLATES: readonly HomeShowcaseTemplate[] = [
  {
    id: 'order-fulfillment',
    kind: 'chart',
    titleKey: 'home.showcase.orderFulfillment',
    descriptionKey: 'home.showcase.orderFulfillmentDesc',
    templateId: 'order-fulfillment-flow',
  },
  {
    id: 'system-architecture',
    kind: 'chart',
    titleKey: 'home.showcase.systemArchitecture',
    descriptionKey: 'home.showcase.systemArchitectureDesc',
    templateId: 'software-release-flow',
  },
  {
    id: 'online-hot-brief',
    kind: 'workflow',
    titleKey: 'home.showcase.supportAutoReply',
    descriptionKey: 'home.showcase.supportAutoReplyDesc',
    templateId: 'online-hot-brief',
  },
  {
    id: 'weekly-report',
    kind: 'workflow',
    titleKey: 'home.showcase.weeklyReport',
    descriptionKey: 'home.showcase.weeklyReportDesc',
    templateId: 'weekly-report-generator',
  },
];

export function getShowcaseTemplatesByKind(
  kind: DocumentKind
): readonly HomeShowcaseTemplate[] {
  return HOME_SHOWCASE_TEMPLATES.filter((item) => item.kind === kind);
}
