import { Tree } from '@nx/devkit';
import { getNpmScope } from './npm';

export function getWorkspaceScope(tree: Tree) {
  return getNpmScope(tree);
}
