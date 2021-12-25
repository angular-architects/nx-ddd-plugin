import { Tree } from '@nrwl/devkit';

/**
 * addTsExport
 * @param filePath path of the file to export from
 * @param filesToExport files to export
 */
export function addTsExport(tree: Tree, filePath: string, filesToExport: string[]): void {
  let content = tree.read(filePath) + '\n';

  for (const file of filesToExport) {
    content += `export * from '${file}';\n`;
  }

  tree.write(filePath, content);
}
