import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  joinPathFragments,
  addDependenciesToPackageJson,
  names,
  readNxJson,
} from '@nx/devkit';

import { libraryGenerator, applicationGenerator } from '@nx/angular/generators';
import { strings } from '@angular-devkit/core';
import { DomainOptions } from './schema';
import { updateDepConst } from '../utils/update-dep-const';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { insertImport } from '@nx/js';
import { insertNgModuleImport } from '@nx/angular/src/generators/utils';
import * as ts from 'typescript';
import { NGRX_VERSION } from '../utils/ngrx-version';
import { getNpmScope } from '../utils/npm';
import { deleteDefaultComponent } from '../utils/delete-default-component';

function convertToStandaloneApp(
  tree: Tree,
  options: { name: string; srcRoot: string; npmScope: string; ngrx: boolean }
) {
  // const mainPath = joinPathFragments(options.srcRoot, 'main.ts');
  // const appComponentPath = joinPathFragments(options.srcRoot, 'app/app.component.ts');
  const appModulePath = joinPathFragments(options.srcRoot, 'app/app.module.ts');
  const welcomePath = joinPathFragments(
    options.srcRoot,
    'app/nx-welcome.component.ts'
  );

  // tree.delete(mainPath);
  // tree.delete(appComponentPath);
  tree.delete(appModulePath);
  tree.delete(welcomePath);

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files/standalone-app'),
    options.srcRoot,
    {
      ngrx: options.ngrx,
      npmScope: names(options.npmScope).fileName,
      ...names(options.name),
      tmpl: '',
    }
  );
}

export default async function (tree: Tree, options: DomainOptions) {
  const appName = strings.dasherize(options.name);
  const appNameAndDirectory = options.appDirectory
    ? `apps/${options.appDirectory}/${appName}`
    : `apps/${appName}`;
  const appNameSlug = strings
    .dasherize(appName)
    .split('/')
    .join('-');
  const appFolderPath = `${appNameAndDirectory}`;
  const appSrcFolder = `${appFolderPath}/src`;
  const appModuleFolder = `${appFolderPath}/src/app`;
  const appModuleFilepath = `${appModuleFolder}/app.module.ts`;

  // additions for Nx20 by LXT
  const domainName = strings.dasherize(options.name);
  const domainNameAndDirectory = options.directory
    ? `${options.directory}/${domainName}`
    : domainName;

  const finalName = domainName + '-domain';
  const finalDirectory = `libs/${domainNameAndDirectory}/domain`;
  const libSrcFolder = `${finalDirectory}/src`;
  const libLibFolder = `${libSrcFolder}/lib`;

  /*if (options.ngrx && !options.addApp) {
    throw new Error(
      `The 'ngrx' option may only be used when the 'addApp' option is used.`
    );
  }*/

  await libraryGenerator(tree, {
    name: finalName,
    prefix: finalName,
    directory: finalDirectory,
    tags: `domain:${domainName},type:domain-logic`,
    publishable: options.type === 'publishable',
    buildable: options.type === 'buildable',
    importPath: options.importPath,
    standalone: options.standalone,
  });

  updateDepConst(tree, (depConst) => {
    depConst.push({
      sourceTag: `domain:${domainName}`,
      onlyDependOnLibsWithTags: [`domain:${domainName}`, 'domain:shared'],
    });
  });

  // generateFiles(
  //   tree,
  //   joinPathFragments(__dirname, './files'), // path to the file templates
  //   libLibFolder,
  //   {}
  // );

  tree.write(joinPathFragments(libLibFolder, './application/.gitkeep'), '');
  tree.write(joinPathFragments(libLibFolder, './entities/.gitkeep'), '');
  tree.write(joinPathFragments(libLibFolder, './infrastructure/.gitkeep'), '');

  if (options.addApp) {
    await applicationGenerator(tree, {
      name: appName,
      directory: appNameAndDirectory,
      tags: `domain:${appName},type:app`,
      style: 'scss',
      standalone: options.standalone
    });
  }

  const wsConfig = readNxJson(tree);
  const npmScope = getNpmScope(tree);
  // const wsConfig = readWorkspaceConfiguration(tree);

  if (options.addApp && options.standalone) {
    convertToStandaloneApp(tree, {
      name: options.name,
      ngrx: options.ngrx || false,
      srcRoot: appSrcFolder,
      npmScope: npmScope,
    });
  }

  if (options.addApp && options.ngrx) {
    addNgrxDependencies(tree);
  }

  if (!options.standalone && options.addApp && options.ngrx) {
    const generateStore = wrapAngularDevkitSchematic(
      '@ngrx/schematics',
      'store'
    );

    await generateStore(tree, {
      project: appNameSlug,
      root: true,
      minimal: true,
      module: 'app.module.ts',
      name: 'state',
    });

    addNgrxImportsToApp(tree, appModuleFilepath);
  }

  if (options.ngrx && options.standalone) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/standalone-lib'),
      libSrcFolder,
      {
        ...options,
        ...names(options.name),
        tmpl: '',
      },
    );

  }

  // fixed by LXT
  deleteDefaultComponent(
    tree,
    finalDirectory,
    finalName,
    !options.ngrx
  );

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

function addNgrxDependencies(tree: Tree) {
  addDependenciesToPackageJson(
    tree,
    {
      '@ngrx/store': NGRX_VERSION,
      '@ngrx/effects': NGRX_VERSION,
      '@ngrx/entity': NGRX_VERSION,
      '@ngrx/store-devtools': NGRX_VERSION,
    },
    {}
  );
}

function addNgrxImportsToApp(tree: Tree, appModuleFilepath: string) {
  const moduleSource = tree.read(appModuleFilepath).toString('utf-8');

  const sourceFile = ts.createSourceFile(
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
    '@ngrx/effects'
  );

  insertNgModuleImport(tree, appModuleFilepath, 'EffectsModule.forRoot()');
}
