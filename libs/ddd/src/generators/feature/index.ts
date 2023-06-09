import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  joinPathFragments,
  names,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { FeatureOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { addTsExport } from '../utils/add-ts-exports';
import {
  addDeclarationWithExportToNgModule,
  addImportToNgModule,
  addImportToTsModule,
} from '../utils/addToNgModule';
import { addNgrxImportsToDomain } from '../utils/add-ngrx-imports-to-domain';
import { fileContains } from '../utils/fileContains';
import { getWorkspaceScope } from '../utils/get-workspace-scope';

export default async function (tree: Tree, options: FeatureOptions) {
  options.app ??= options.domain;
  options.domainDirectory ??= '';
  options.entity ??= '';

  const workspaceName = getWorkspaceScope(tree);
  const featureName = strings.dasherize(options.name)
    ? strings.dasherize(options.name)
    : '';
  const featureDirectory = options.directory ? options.directory : '';
  const featurePrefix = options.prefix ? options.prefix : '';
  const domainName = strings.dasherize(options.domain)
    ? strings.dasherize(options.domain)
    : '';
  const domainDirectory = options.domainDirectory
    ? options.domainDirectory
    : '';
  const appName = strings.dasherize(options.app)
    ? strings.dasherize(options.app)
    : '';
  const appDirectory = options.appDirectory ? options.appDirectory : '';
  const featureDirectoryAndName = featureDirectory
    ? `${featureDirectory}/${featureName}`
    : featureName;
  const featureDirectoryAndNameDasherized = `${featureDirectoryAndName}`
    .split('/')
    .join('-');
  const domainNameAndDirectory = domainDirectory
    ? `${domainName}/${domainDirectory}`
    : `${domainName}`;
  const domainNameAndDirectoryDasherized = `${domainNameAndDirectory}`
    .split('/')
    .join('-');
  const appDirectoryAndName = appDirectory
    ? `${appDirectory}/${appName}`
    : appName;
  const appDirectoryAndNameDasherized = `${appDirectoryAndName}`
    .split('/')
    .join('-');
  const domainNameAndDirectoryPath = `libs/${domainNameAndDirectory}`;
  const domainFolderPath = `${domainNameAndDirectoryPath}/domain`;
  const domainLibFolderPath = `${domainFolderPath}/src/lib`;
  const domainModuleFilepath = `${domainLibFolderPath}/${domainName}-domain.module.ts`;
  const domainModuleClassName =
    strings.classify(domainNameAndDirectoryDasherized) + 'DomainModule';
  const domainImportPath = `${workspaceName}/${domainNameAndDirectory}/domain`;
  const domainIndexPath = `${domainFolderPath}/src/index.ts`;
  const featureFolderName = (featurePrefix ? 'feature-' : '') + featureName;
  const featureDirectoryAndFolderName = featureDirectory
    ? `${featureDirectory}/${featureFolderName}`
    : featureFolderName;

  const featureDirectoryAndFolderNameDasherized =
    `${featureDirectoryAndFolderName}`.split('/').join('-');

  const featureLibFolderPath = `${domainNameAndDirectoryPath}/${featureDirectoryAndFolderName}/src/lib`;
  const featureModuleFilepath = `${featureLibFolderPath}/${domainNameAndDirectoryDasherized}-${featureDirectoryAndFolderNameDasherized}.module.ts`;
  const featureModuleClassName = strings.classify(
    `${domainNameAndDirectoryDasherized}-${featureFolderName}Module`
  );
  const featureImportPath = `${workspaceName}/${domainNameAndDirectory}/${featureFolderName}`;
  const featureIndexPath = `${domainNameAndDirectoryPath}/${featureDirectoryAndFolderName}/src/index.ts`;
  const entityName = options.entity ? strings.dasherize(options.entity) : '';
  const featureComponentImportPath = `./${featureDirectoryAndNameDasherized}.component`;
  const featureComponentClassName = strings.classify(
    `${featureDirectoryAndNameDasherized}Component`
  );
  const appModulePath = `apps/${appDirectoryAndName}/src/app/app.module.ts`;

  const requiredAppCompPath = `apps/${appDirectoryAndName}/src/app/app.component.ts`;
  if (!options.noApp && !tree.exists(requiredAppCompPath)) {
    throw new Error(
      `Specified app ${options.app} does not exist: ${requiredAppCompPath} expected!`
    );
  }

  if (options.ngrx && !entityName) {
    throw new Error(
      `The 'ngrx' option may only be used when the 'entity' option is used.`
    );
  }

  await libraryGenerator(tree, {
    name: featureFolderName,
    directory: featureDirectory
      ? `${domainNameAndDirectory}/${featureDirectory}`
      : `${domainNameAndDirectory}`,
    tags: `domain:${domainName},type:feature`,
    prefix: domainNameAndDirectoryDasherized,
    publishable: options.type === 'publishable',
    buildable: options.type === 'buildable',
    importPath: options.importPath,
    standalone: options.standalone,
  });

  if (!options.standalone) {
    wireUpNgModules(tree, {
      featureModuleFilepath,
      domainModuleClassName,
      domainImportPath,
      options,
      appModulePath,
      featureModuleClassName,
      featureImportPath,
    });
  }

  generate(tree, {
    options,
    entityName,
    domainLibFolderPath,
    workspaceName,
    featureLibFolderPath,
  });

  if (entityName) {
    addTsExport(tree, domainIndexPath, [
      `./lib/entities/${entityName}`,
      `./lib/infrastructure/${entityName}.data.service`,
    ]);
  }

  if (options.ngrx && entityName && tree.exists(domainModuleFilepath)) {
    addNgrxImportsToDomain(tree, domainModuleFilepath, entityName);
    addTsExport(tree, domainIndexPath, [
      `./lib/+state/${entityName}/${entityName}.actions`,
    ]);
  }

  addTsExport(tree, domainIndexPath, [
    `./lib/application/${featureDirectoryAndNameDasherized}.facade`, //featureDirectoryAndNameDasherized
  ]);

  addTsExport(tree, featureIndexPath, [
    `./lib/${featureDirectoryAndNameDasherized}.component`,
  ]);

  if (!options.standalone) {
    addDeclarationWithExportToNgModule(tree, {
      filePath: featureModuleFilepath,
      importClassName: featureComponentClassName,
      importPath: featureComponentImportPath,
    });
  }

  if (options.standalone && options.ngrx) {
    updateProviders(tree, {
      domainLibFolderPath,
      entity: options.entity,
    });
  }

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

function updateProviders(
  tree: Tree,
  options: { entity: string; domainLibFolderPath: string }
) {
  const entityNames = names(options.entity);

  addImportToTsModule(tree, {
    filePath: `${options.domainLibFolderPath}/providers.ts`,
    importClassName: `${entityNames.className}Effects`,
    importPath: `./+state/${entityNames.fileName}/${entityNames.fileName}.effects`,
  });

  addImportToTsModule(tree, {
    filePath: `${options.domainLibFolderPath}/providers.ts`,
    importClassName: `${entityNames.constantName}_FEATURE_KEY`,
    importPath: `./+state/${entityNames.fileName}/${entityNames.fileName}.reducer`,
  });

  addImportToTsModule(tree, {
    filePath: `${options.domainLibFolderPath}/providers.ts`,
    importClassName: `reducer`,
    importPath: `./+state/${entityNames.fileName}/${entityNames.fileName}.reducer`,
  });

  const providersToAdd = `
    provideState(${entityNames.constantName}_FEATURE_KEY, reducer),
    provideEffects([${entityNames.className}Effects]),
];`;

  const providers = tree.read(
    `${options.domainLibFolderPath}/providers.ts`,
    'utf-8'
  );
  const updated = providers.replace('];', providersToAdd);
  tree.write(`${options.domainLibFolderPath}/providers.ts`, updated);
}

function wireUpNgModules(
  tree: Tree,
  {
    featureModuleFilepath,
    domainModuleClassName,
    domainImportPath,
    options,
    appModulePath,
    featureModuleClassName,
    featureImportPath,
  }: {
    featureModuleFilepath: string;
    domainModuleClassName: string;
    domainImportPath: string;
    options: FeatureOptions;
    appModulePath: string;
    featureModuleClassName: string;
    featureImportPath: string;
  }
) {
  addImportToNgModule(tree, {
    filePath: featureModuleFilepath,
    importClassName: domainModuleClassName,
    importPath: domainImportPath,
  });

  if (!options.noApp && !options.lazy && tree.exists(appModulePath)) {
    addImportToNgModule(tree, {
      filePath: appModulePath,
      importClassName: featureModuleClassName,
      importPath: featureImportPath,
    });

    const contains = fileContains(tree, appModulePath, 'HttpClientModule');
    if (!contains) {
      addImportToNgModule(tree, {
        filePath: appModulePath,
        importClassName: 'HttpClientModule',
        importPath: '@angular/common/http',
      });
    }
  }
}

function generate(
  tree: Tree,
  {
    options,
    entityName,
    domainLibFolderPath,
    workspaceName,
    featureLibFolderPath,
  }: {
    options: FeatureOptions;
    entityName: string;
    domainLibFolderPath: string;
    workspaceName: string;
    featureLibFolderPath: string;
  }
) {
  const tmpl = '';
  const params = {
    ...strings,
    ...options,
    'name@dasherize': strings.dasherize(options.name),
    'entity@dasherize': strings.dasherize(options.entity ?? ''),
    workspaceName,
    entityName,
    domainLibFolderPath,
    featureLibFolderPath,
    tmpl,
  };

  if (options.ngrx && entityName) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/forDomainWithNgrx'),
      domainLibFolderPath,
      params
    );
  } else if (!options.ngrx && entityName) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/forDomain'),
      domainLibFolderPath,
      params
    );
  } else if (!options.ngrx && !entityName) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/forDomain/application'),
      joinPathFragments(domainLibFolderPath, 'application'),
      params
    );
  }

  if (options.ngrx && entityName) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/forFeatureWithNgrx'),
      featureLibFolderPath,
      params
    );
  } else if (!options.ngrx) {
    generateFiles(
      tree,
      joinPathFragments(__dirname, './files/forFeature'),
      featureLibFolderPath,
      params
    );
  }
}
