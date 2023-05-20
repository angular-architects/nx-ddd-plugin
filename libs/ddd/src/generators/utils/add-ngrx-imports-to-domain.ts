import { insertNgModuleProperty } from '@nx/angular/src/generators/utils';
import { Tree } from '@nx/devkit';
import { classify, dasherize } from '@nx/workspace/src/utils/strings';
import { addImportToNgModule, addImportToTsModule } from './addToNgModule';
import { fileContains } from './fileContains';

/**
 * addNgrxImportsToDomain
 * @param modulePath the path of the module the import is being included in
 * @param entityName the name of the entity
 */
export function addNgrxImportsToDomain(
  tree: Tree,
  modulePath: string,
  entityName: string
): void {
  const pathPrefix = `./+state/${dasherize(entityName)}/${dasherize(
    entityName
  )}`;
  const reducerPath = `${pathPrefix}.reducer`;
  const reducerImports = `from${classify(entityName)}`;
  const effectsName = `${classify(entityName)}Effects`;
  const effectsPath = `${pathPrefix}.effects`;

  const classfiedEntityName = classify(entityName);
  const fromFeature = `from${classfiedEntityName}`;
  const storeForFeature = `StoreModule.forFeature(${fromFeature}.${classfiedEntityName.toUpperCase()}_FEATURE_KEY, ${fromFeature}.reducer)`;
  const effectsForFeature = `EffectsModule.forFeature([${effectsName}])`;

  if (!tree.exists(modulePath)) {
    return;
  }

  addImportToTsModule(tree, {
    filePath: modulePath,
    importClassName: effectsName,
    importPath: effectsPath,
  });

  addImportAllToTsModule(tree, {
    filePath: modulePath,
    importAs: reducerImports,
    importPath: reducerPath,
  });

  const containsStore = fileContains(tree, modulePath, 'StoreModule');

  if (!containsStore) {
    addImportToTsModule(tree, {
      filePath: modulePath,
      importClassName: 'StoreModule',
      importPath: '@ngrx/store',
    });
  }

  const containsEffects = fileContains(tree, modulePath, 'EffectsModule');

  if (!containsEffects) {
    addImportToTsModule(tree, {
      filePath: modulePath,
      importClassName: 'EffectsModule',
      importPath: '@ngrx/effects',
    });
  }

  insertNgModuleProperty(tree, modulePath, storeForFeature, 'imports');

  insertNgModuleProperty(tree, modulePath, effectsForFeature, 'imports');
}

function addImportAllToTsModule(
  tree: Tree,
  options: { filePath: string; importAs: string; importPath: string }
) {
  const content = tree.read(options.filePath).toString('utf-8');
  const updated = `import * as ${options.importAs} from '${options.importPath}';\n${content}`;
  tree.write(options.filePath, updated);
}
