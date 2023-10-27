import { Tree, readJson } from "@nx/devkit";

export function getNpmScope(tree: Tree) {
    const { name } = tree.exists('package.json')
      ? readJson<{ name?: string }>(tree, 'package.json')
      : { name: null };
  
    if (name?.startsWith('@')) {
      return name.split('/')[0];
    }
  }