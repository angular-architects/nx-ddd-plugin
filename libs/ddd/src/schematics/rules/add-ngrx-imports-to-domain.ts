import { Tree, Rule } from '@angular-devkit/schematics';
import { classify, dasherize } from '@nrwl/workspace/src/utils/strings';
import {
  addImportToModule,
  insertImport,
} from '@schematics/angular/utility/ast-utils';
import { readIntoSourceFile, insert } from '../utils';

/**
 * addNgrxImportsToDomain
 * @param modulePath the path of the module the import is being included in
 * @param entityName the name of the entity
 */
export function addNgrxImportsToDomain(
  modulePath: string,
  entityName: string
): Rule {
  return (host: Tree) => {
    const pathPrefix = `./+state/${dasherize(entityName)}/${dasherize(
      entityName
    )}`;
    const reducerPath = `${pathPrefix}.reducer`;
    const reducerImports = `* as from${classify(entityName)}`;
    const effectsName = `${classify(entityName)}Effects`;
    const effectsPath = `${pathPrefix}.effects`;
    const effectsImports = `{ ${effectsName} }`;

    const classfiedEntityName = classify(entityName);
    const fromFeature = `from${classfiedEntityName}`;
    const storeForFeature = `StoreModule.forFeature(${fromFeature}.${classfiedEntityName.toUpperCase()}_FEATURE_KEY, ${fromFeature}.reducer)`;
    const effectsForFeature = `EffectsModule.forFeature([${effectsName}])`;

    if (!host.exists(modulePath)) {
      return;
    }

    const source = readIntoSourceFile(host, modulePath);

    insert(host, modulePath, [
      insertImport(source, modulePath, effectsImports, effectsPath, true),
      insertImport(source, modulePath, reducerImports, reducerPath, true),
      ...addImportToModule(source, modulePath, storeForFeature, '@ngrx/store'),
      ...addImportToModule(
        source,
        modulePath,
        effectsForFeature,
        '@ngrx/effects'
      ),
    ]);
  };
}
