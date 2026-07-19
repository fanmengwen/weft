export interface StudioEmptyPromptExample {
  id: string;
  emoji: string;
  bg: string;
  fg: string;
  labelKey: string;
  labelDefault: string;
  promptKey: string;
  promptDefault: string;
}

// Prefer classic flowchart topics (auth / checkout failure / release gates)
// over multi-cloud architecture, which AI drafts less reliably in this product.
export const STUDIO_EMPTY_PROMPT_EXAMPLES: StudioEmptyPromptExample[] = [
  {
    id: 'user-registration',
    emoji: '🔑',
    bg: '#E4EBFA',
    fg: '#3663C9',
    labelKey: 'commandBar.aiStudio.emptyExamples.userRegistration',
    labelDefault: 'User registration and login',
    promptKey: 'commandBar.aiStudio.emptyExamples.userRegistrationPrompt',
    promptDefault:
      'User registration and login flow with email verification and password retry after failed login',
  },
  {
    id: 'ecommerce-checkout',
    emoji: '📦',
    bg: '#E2F2E8',
    fg: '#1F7D4D',
    labelKey: 'commandBar.aiStudio.emptyExamples.ecommerceCheckout',
    labelDefault: 'Checkout with payment failure',
    promptKey: 'commandBar.aiStudio.emptyExamples.ecommerceCheckoutPrompt',
    promptDefault:
      'E-commerce checkout from cart to order confirmation, including payment gateway failure and inventory-out branches',
  },
  {
    id: 'cicd-release',
    emoji: '🚀',
    bg: '#F9EADC',
    fg: '#B05617',
    labelKey: 'commandBar.aiStudio.emptyExamples.cicdRelease',
    labelDefault: 'CI/CD release pipeline',
    promptKey: 'commandBar.aiStudio.emptyExamples.cicdReleasePrompt',
    promptDefault:
      'CI/CD release pipeline from merge and test gates through canary deploy, approval, and rollback',
  },
];
