import { strings } from '@angular-devkit/core';
import { applicationGenerator, libraryGenerator } from '@nx/angular/generators';
import { insertNgModuleImport } from '@nx/angular/src/generators/utils';
import {
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  names,
  readWorkspaceConfiguration,
} from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { insertImport } from '@nx/js';
import * as ts from 'typescript';
import { NGRX_VERSION } from '../utils/ngrx-version';
import { updateDepConst } from '../utils/update-dep-const';
import { DomainOptions } from './schema';

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

export const angularArchitectsDddDomainGenerator = async (
  tree: Tree,
  options: DomainOptions
) => {
  const appName = strings.dasherize(options.name);
  const appNameAndDirectory = options.appDirectory
    ? `${options.appDirectory}/${appName}`
    : appName;
  const appNameAndDirectoryDasherized = strings
    .dasherize(appNameAndDirectory)
    .split('/')
    .join('-');
  const appFolderPath = `apps/${appNameAndDirectory}`;
  const appSrcFolder = `${appFolderPath}/src`;
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
  const libSrcFolder = `${libFolderPath}/domain/src`;

  // if (options.ngrx && !options.addApp) {
  //   throw new Error(
  //     `The 'ngrx' option may only be used when the 'addApp' option is used.`
  //   );
  // }

  await libraryGenerator(tree, {
    name: 'domain',
    directory: libNameAndDirectory,
    tags: `domain:${libName},type:domain-logic`,
    prefix: libName,
    publishable: options.type === 'publishable',
    buildable: options.type === 'buildable',
    importPath: options.importPath,
    standalone: options.standalone,
  });

  updateDepConst(tree, (depConst) => {
    depConst.push({
      sourceTag: `domain:${libName}`,
      onlyDependOnLibsWithTags: [`domain:${libName}`, 'domain:shared'],
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
      directory: options.appDirectory,
      tags: `domain:${appName},type:app`,
      style: 'scss',
      standalone: options.standalone,
    });
  }

  const wsConfig = readWorkspaceConfiguration(tree);
  if (options.addApp && options.standalone) {
    convertToStandaloneApp(tree, {
      name: options.name,
      ngrx: options.ngrx || false,
      srcRoot: appSrcFolder,
      npmScope: wsConfig.npmScope,
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
      project: appNameAndDirectoryDasherized,
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
      }
    );
  }

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
};

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
export default angularArchitectsDddDomainGenerator;
