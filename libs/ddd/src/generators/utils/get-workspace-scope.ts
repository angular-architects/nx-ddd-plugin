import { Tree, readWorkspaceConfiguration } from '@nrwl/devkit';

export function getWorkspaceScope(tree: Tree) {
  const wsConfig = readWorkspaceConfiguration(tree);
  const workspaceName = `@${wsConfig.npmScope}`;
  return workspaceName;
}
