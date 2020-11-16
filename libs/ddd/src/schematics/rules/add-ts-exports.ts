import { Rule, Tree } from '@angular-devkit/schematics';

/**
 * addTsExport
 * @param filePath path of the file to export from
 * @param filesToExport files to export
 */
export function addTsExport(filePath: string, filesToExport: string[]): Rule {
  return (host: Tree) => {
    let content = host.read(filePath) + '\n';

    for (const file of filesToExport) {
      content += `export * from '${file}';\n`;
    }

    host.overwrite(filePath, content);
  };
}
