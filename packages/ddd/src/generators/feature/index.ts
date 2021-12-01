import {
  chain,
  externalSchematic,
  Rule,
  Tree,
  apply,
  url,
  template,
  move,
  mergeWith,
  noop,
} from '@angular-devkit/schematics';
import { FeatureOptions } from './schema';
import { strings } from '@angular-devkit/core';
import {
  addDeclaration,
  addExport,
  addImport,
  addTsExport,
  filterTemplates,
  addNgrxImportsToDomain,
  addNgRxToPackageJson,
} from '../rules';
import { readWorkspaceName } from '../../utils';

export default function (options: FeatureOptions): Rule {
  return (host: Tree) => {
    if (!options.app) {
      options.app = options.domain;
    }

    const workspaceName = readWorkspaceName(host);
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

    const requiredAppModulePath = `apps/${appDirectoryAndName}/src/app/app.module.ts`;
    if (!host.exists(requiredAppModulePath)) {
      throw new Error(
        `Specified app ${options.app} does not exist: ${requiredAppModulePath} expected!`
      );
    }

    if (options.ngrx && !entityName) {
      throw new Error(
        `The 'ngrx' option may only be used when the 'entity' option is used.`
      );
    }

    const updatedEntityNameOptions = Object.assign({}, options);
    // updatedEntityNameOptions.entity = featureDirectoryAndNameDasherized;

    const domainTemplates =
      options.ngrx && entityName
        ? apply(url('./files/forDomainWithNgrx'), [
            filterTemplates(updatedEntityNameOptions),
            template({
              ...strings,
              ...updatedEntityNameOptions,
              workspaceName,
            }),
            move(domainLibFolderPath),
          ])
        : apply(url('./files/forDomain'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(domainLibFolderPath),
          ]);

    const featureTemplates =
      options.ngrx && entityName
        ? apply(url('./files/forFeatureWithNgrx'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(featureLibFolderPath),
          ])
        : apply(url('./files/forFeature'), [
            template({ ...strings, ...options, workspaceName }),
            move(featureLibFolderPath),
          ]);

    return chain([
      externalSchematic('@nrwl/angular', 'lib', {
        name: featureFolderName, // `feature-${featureDirectoryAndNameDasherized}`,
        directory: featureDirectory
          ? `${domainNameAndDirectory}/${featureDirectory}`
          : `${domainNameAndDirectory}`,
        tags: `domain:${domainName},type:feature`,
        style: 'scss',
        prefix: domainNameAndDirectoryDasherized,
        publishable: options.type === 'publishable',
        buildable: options.type === 'buildable',
        importPath: options.importPath,
      }),
      addImport(featureModuleFilepath, domainImportPath, domainModuleClassName),
      !options.lazy && host.exists(appModulePath)
        ? chain([
            addImport(
              appModulePath,
              featureImportPath,
              featureModuleClassName,
              true
            ),
            addImport(
              appModulePath,
              '@angular/common/http',
              'HttpClientModule',
              true
            ),
          ])
        : noop(),
      mergeWith(domainTemplates),
      entityName
        ? addTsExport(domainIndexPath, [
            `./lib/entities/${entityName}`,
            `./lib/infrastructure/${entityName}.data.service`,
          ])
        : noop(),
      options.ngrx && entityName && host.exists(domainModuleFilepath)
        ? chain([
            addNgRxToPackageJson(),
            addNgrxImportsToDomain(domainModuleFilepath, entityName),
            addTsExport(domainIndexPath, [
              `./lib/+state/${entityName}/${entityName}.actions`,
            ]),
          ])
        : noop(),
      addTsExport(domainIndexPath, [
        `./lib/application/${featureDirectoryAndNameDasherized}.facade`, //featureDirectoryAndNameDasherized
      ]),
      mergeWith(featureTemplates),
      addTsExport(featureIndexPath, [
        `./lib/${featureDirectoryAndNameDasherized}.component`,
      ]),
      addDeclaration(
        featureModuleFilepath,
        featureComponentImportPath,
        featureComponentClassName
      ),
      addExport(
        featureModuleFilepath,
        featureComponentImportPath,
        featureComponentClassName
      ),
    ]);
  };
}
