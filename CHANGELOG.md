# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Code Simplifier
- `code-simplifier` pass completed for:
  - `src/components/CustomNode.tsx`
  - `src/components/ImageNode.tsx`
  - `src/components/TextNode.tsx`
  - `src/components/GroupNode.tsx`
  - `src/components/TopNav.tsx`
  - `src/components/top-nav/TopNavActions.tsx`
  - `src/components/top-nav/TopNavMenu.tsx`
  - `src/components/NavigationControls.tsx`
  - `src/components/ShareModal.tsx`
  - `src/components/toolbar/ToolbarAddMenu.tsx`
  - `src/components/ConnectMenu.tsx`

### Changed
- **Styling**: Replaced hardcoded `indigo-500` usage in `CustomNode`, `ImageNode`, `TextNode`, and `GroupNode` with `var(--brand-primary)`.
- **Styling**: Updated React Flow `<NodeResizer />` visuals with explicit side borders and square handles.
- **Navbar Layout**: Moved "Version History" and "Import from JSON" into the hamburger menu, and moved the Language Selector to the menu footer.
- **Navbar Layout**: Reduced spacing between the `OpenFlowKit` logo and text.
- **Navbar Layout**: Replaced the text "BETA" badge with a `ShieldAlert` icon and local-storage privacy tooltip.
- **Navbar Layout**: Removed the redundant "OpenFlowKit AI Canvas" brand-hover tooltip.
- **Collaboration UI**: Replaced room/status badges with an avatar group and compact status dot.
- **Components**: Converted "Share" to a `Share2` icon button matching top-nav button styles.
- **Components**: Updated `NavigationControls` shortcuts icon to `HelpCircle`, residing inside the primary zoom control bar.

### Added
- **Components**: Added `<ShareModal />` via React Portal (`document.body`) with "Copy Link" support.

### Removed
- **Features**: Removed "User Journey" from `ToolbarAddMenu` and `ConnectMenu`.

### Fixed
- **Styling**: Fixed `isBeveled` propagation to the hamburger button through `TopNavActions`.
