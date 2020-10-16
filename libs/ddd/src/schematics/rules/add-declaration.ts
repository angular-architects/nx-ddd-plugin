import { Rule, Tree } from '@angular-devkit/schematics';
import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
import { readIntoSourceFile, insert } from '../utils';

/**
 * addDeclaration
 * @param modulePath path of the module to add the declaration to
 * @param componentToImportPath path of the component being imported
 * @param componentToImportName name of the component being imported
 */
export function addDeclaration(
  modulePath: string,
  componentToImportPath: string,
  componentToImportName: string
): Rule {
  return (host: Tree) => {
    const source = readIntoSourceFile(host, modulePath);

    insert(host, modulePath, [
      ...addDeclarationToModule(
        source,
        modulePath,
        componentToImportName,
        componentToImportPath
      ),
    ]);
  };
}
