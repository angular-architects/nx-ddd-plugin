import { Rule, Tree } from '@angular-devkit/schematics';
import { addExportToModule } from '@schematics/angular/utility/ast-utils';
import { insert, readIntoSourceFile } from '../utils';

/**
 * addExport
 * @param modulePath - path of the module to include the export in
 * @param componentToImportPath path of the component to import
 * @param componentToImportName name of the component to import
 */
export function addExport(
  modulePath: string,
  componentToImportPath: string,
  componentToImportName: string
): Rule {
  return (host: Tree) => {
    const source = readIntoSourceFile(host, modulePath);

    insert(host, modulePath, [
      ...addExportToModule(
        source,
        modulePath,
        componentToImportName,
        componentToImportPath
      ),
    ]);
  };
}
