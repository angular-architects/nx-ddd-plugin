import { Rule, Tree } from '@angular-devkit/schematics';
import { addExportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { readIntoSourceFile } from '../utils';

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

    const changes = addExportToModule(
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
