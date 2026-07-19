export type HomePageTab =
  | 'home'
  | 'files'
  | 'templates'
  | 'runs'
  | 'trash'
  | 'settings'
  | 'account'
  /** @deprecated kept for /mcp route compatibility; not shown in design sidebar */
  | 'mcp';

export function getHomePageTab(pathname: string): HomePageTab {
  switch (pathname) {
    case '/settings':
      return 'settings';
    case '/templates':
      return 'templates';
    case '/files':
      return 'files';
    case '/runs':
      return 'runs';
    case '/trash':
      return 'trash';
    case '/account':
      return 'account';
    case '/mcp':
      return 'mcp';
    default:
      return 'home';
  }
}

export function getHomePagePath(tab: HomePageTab): string {
  switch (tab) {
    case 'settings':
      return '/settings';
    case 'templates':
      return '/templates';
    case 'files':
      return '/files';
    case 'runs':
      return '/runs';
    case 'trash':
      return '/trash';
    case 'account':
      return '/account';
    case 'mcp':
      return '/mcp';
    default:
      return '/home';
  }
}
