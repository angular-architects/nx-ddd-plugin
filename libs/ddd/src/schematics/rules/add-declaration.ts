import { Rule, Tree } from '@angular-devkit/schematics';
import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { readIntoSourceFile } from '../utils';

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

    const changes = addDeclarationToModule(
      source,
      modulePath,
      componentToImportName,
      componentToImportPath
    );

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
  };
}
