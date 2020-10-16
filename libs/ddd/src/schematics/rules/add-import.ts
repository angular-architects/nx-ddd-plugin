import { Rule, Tree } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { insert, readIntoSourceFile } from '../utils';

/**
 * addImport
 * @param modulePath the path of the module the import is being included in
 * @param ngModuleToImportPath the path of angular module that is being imported.
 * @param ngModuleToImportName the name of the angular module that is being imported.
 * @param optional whether or not optional
 */
export function addImport(
  modulePath: string,
  ngModuleToImportPath: string,
  ngModuleToImportName: string,
  optional = false
): Rule {
  return (host: Tree) => {
    if (optional && !host.exists(modulePath)) {
      return;
    }

    const source = readIntoSourceFile(host, modulePath);

    insert(host, modulePath, [
      ...addImportToModule(
        source,
        modulePath,
        ngModuleToImportName,
        ngModuleToImportPath
      ),
    ]);
  };
}
