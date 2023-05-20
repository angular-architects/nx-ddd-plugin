import { Tree, readWorkspaceConfiguration } from '@nx/devkit';

export function getWorkspaceScope(tree: Tree) {
  const wsConfig = readWorkspaceConfiguration(tree);
  const workspaceName = `@${wsConfig.npmScope}`;
  return workspaceName;
}
