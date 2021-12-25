import { Tree, formatFiles, installPackagesTask, generateFiles, joinPathFragments, readProjectConfiguration, addDependenciesToPackageJson } from '@nrwl/devkit';
import { libraryGenerator, applicationGenerator } from '@nrwl/angular/generators';
import { strings } from '@angular-devkit/core';
import { DomainOptions } from './schema';
import { updateDepConst } from '../utils/update-dep-const';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import { insertImport } from '@nrwl/workspace/src/utilities/ast-utils';
import { insertNgModuleImport } from '@nrwl/angular/src/generators/utils';
import * as ts from 'typescript';
import { NGRX_VERSION } from '../utils/ngrx-version';

export default async function (tree: Tree, options: DomainOptions) {
  
  const appName = strings.dasherize(options.name);
  const appNameAndDirectory = options.appDirectory
    ? `${options.appDirectory}/${appName}`
    : appName;
  const appNameAndDirectoryDasherized = strings
    .dasherize(appNameAndDirectory)
    .split('/')
    .join('-');
  const appFolderPath = `apps/${appNameAndDirectory}`;
  const appModuleFolder = `${appFolderPath}/src/app`;
  const appModuleFilepath = `${appModuleFolder}/app.module.ts`;

  const libName = strings.dasherize(options.name);
  const libNameAndDirectory = options.directory
    ? `${options.directory}/${libName}`
    : libName;
  const libNameAndDirectoryDasherized = strings
    .dasherize(libNameAndDirectory)
    .split('/')
    .join('-');
  const libFolderPath = `libs/${libNameAndDirectory}`;
  const libLibFolder = `${libFolderPath}/domain/src/lib`;

  if (options.ngrx && !options.addApp) {
    throw new Error(
      `The 'ngrx' option may only be used when the 'addApp' option is used.`
    );
  }

  await libraryGenerator(tree, {
    name: 'domain',
    directory: libNameAndDirectory,
    tags: `domain:${libName},type:domain-logic`,
    prefix: libName,
    publishable: options.type === 'publishable',
    buildable: options.type === 'buildable',
    importPath: options.importPath
  });

  updateDepConst(tree, (depConst) => {
    depConst.push({
      sourceTag: `domain:${libName}`,
      onlyDependOnLibsWithTags: [`domain:${libName}`, 'domain:shared'],
    });
  });

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'), // path to the file templates
    libLibFolder,
    {}
  );

  if (options.addApp) {
    await applicationGenerator(tree, {
      name: appName,
      directory: options.appDirectory,
      tags: `domain:${appName},type:app`,
      style: 'scss',
    });
  }

  if (options.addApp && options.ngrx) {
    const generateStore = wrapAngularDevkitSchematic('@ngrx/schematics', 'store');
    
    await generateStore(tree, {
      project: appNameAndDirectoryDasherized,
      root: true,
      minimal: true,
      module: 'app.module.ts',
      name: 'state',
    });

    addNgrxImportsToApp(tree, appModuleFilepath);
    addNgrxDependencies(tree);

    await formatFiles(tree);
    return () => {
      installPackagesTask(tree);
    };
  
  }

}

function addNgrxDependencies(tree: Tree) {
  addDependenciesToPackageJson(tree, {
    '@ngrx/store': NGRX_VERSION,
    '@ngrx/effects': NGRX_VERSION,
    '@ngrx/entity': NGRX_VERSION,
    '@ngrx/store-devtools': NGRX_VERSION,
  }, {});
}

function addNgrxImportsToApp(tree: Tree, appModuleFilepath: string) {
  const moduleSource = tree.read(appModuleFilepath, 'utf-8');

  let sourceFile = ts.createSourceFile(
    appModuleFilepath,
    moduleSource,
    ts.ScriptTarget.Latest,
    true
  );

  insertImport(
    tree,
    sourceFile,
    appModuleFilepath,
    'EffectsModule',
    '@ngrx/effects');

  insertNgModuleImport(tree, appModuleFilepath, 'EffectsModule.forRoot()');

}

