import { Tree, Rule } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { readIntoSourceFile, insert } from '../utils';

/**
 * addNgrxImportsToApp
 * @param modulePath the path of the moudule the import is being included in
 */
export function addNgrxImportsToApp(modulePath: string): Rule {
  return (host: Tree) => {
    const effectsForRoot = `EffectsModule.forRoot()`;

    if (!host.exists(modulePath)) {
      return;
    }

    const source = readIntoSourceFile(host, modulePath);

    insert(host, modulePath, [
      ...addImportToModule(source, modulePath, effectsForRoot, '@ngrx/effects'),
    ]);
  };
}
