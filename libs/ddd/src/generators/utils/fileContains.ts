import { Tree } from '@nrwl/devkit';

export function fileContains(tree: Tree, appModulePath: string, subStr: string) {
  return tree.read(appModulePath).toString('utf-8').indexOf(subStr) !== -1;
}
