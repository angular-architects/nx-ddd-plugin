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
import { readWorkspaceName } from '../utils';

export default function (options: FeatureOptions): Rule {
  return (host: Tree) => {
    const workspaceName = readWorkspaceName(host);

    const appsDirectory = options.appDirectory;
    const libsDirectory = options.directory;

    const domainName = strings.dasherize(options.domain);
    const domainNameAndDirectory = `${domainName}/${libsDirectory}`;
    const domainNameAndDirectoryPath = `libs/${domainNameAndDirectory}`;
    const domainFolderPath = `${domainNameAndDirectoryPath}/domain`;
    const domainLibFolder = `${domainFolderPath}/src/lib`;
    const domainModuleFilepath = `${domainLibFolder}/${domainName}-domain.module.ts`;
    const domainModuleClassName =
      strings.classify(domainNameAndDirectory) + 'DomainModule';
    const domainImportPath = `${workspaceName}/${domainNameAndDirectory}/domain`;
    const domainIndexPath = `${domainFolderPath}/src/index.ts`;

    const featurePrefix = options.prefix;
    const featureName = strings.dasherize(options.name);
    const featureFolderName = (featurePrefix ? 'feature-' : '') + featureName;
    const featurePath = `${domainNameAndDirectoryPath}/${featureFolderName}/src/lib`;
    const featureModulePath = `${featurePath}/${domainName}-${featureFolderName}.module.ts`;
    const featureModuleClassName = strings.classify(
      `${domainNameAndDirectory}-${featureFolderName}Module`
    );
    const featureImportPath = `${workspaceName}/${domainNameAndDirectory}/${featureFolderName}`;
    const featureIndexPath = `${domainNameAndDirectoryPath}/${featureFolderName}/src/index.ts`;

    const entityName = options.entity ? strings.dasherize(options.entity) : '';

    const featureComponentImportPath = `./${featureName}.component`;
    const featureComponentClassName = strings.classify(
      `${featureName}Component`
    );

    const appName = options.app || domainName;
    const appFolderName = strings.dasherize(appName);
    const appModulePath = `apps/${appFolderName}/${appsDirectory}/src/app/app.module.ts`;

    if (options.app) {
      const requiredAppModulePath = `apps/${appFolderName}/${appsDirectory}/src/app/app.module.ts`;
      if (!host.exists(requiredAppModulePath)) {
        throw new Error(
          `Specified app ${options.app} does not exist: ${requiredAppModulePath} expected!`
        );
      }
    }

    if (options.ngrx && !entityName) {
      throw new Error(
        `The 'ngrx' option may only be used when the 'entity' option is used.`
      );
    }

    const domainTemplates =
      options.ngrx && entityName
        ? apply(url('./files/forDomainWithNgrx'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(domainLibFolder),
          ])
        : apply(url('./files/forDomain'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(domainLibFolder),
          ]);

    const featureTemplates =
      options.ngrx && entityName
        ? apply(url('./files/forFeatureWithNgrx'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(featurePath),
          ])
        : apply(url('./files/forFeature'), [
            template({ ...strings, ...options, workspaceName }),
            move(featurePath),
          ]);

    return chain([
      externalSchematic('@nrwl/angular', 'lib', {
        name: `feature-${featureName}`,
        directory: domainNameAndDirectory,
        tags: `domain:${domainName},type:feature`,
        style: 'scss',
        prefix: domainNameAndDirectory,
        publishable: options.type === 'publishable',
        buildable: options.type === 'buildable',
      }),
      addImport(featureModulePath, domainImportPath, domainModuleClassName),
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
      addTsExport(domainIndexPath, [`./lib/application/${featureName}.facade`]),
      mergeWith(featureTemplates),
      addTsExport(featureIndexPath, [`./lib/${featureName}.component`]),
      addDeclaration(
        featureModulePath,
        featureComponentImportPath,
        featureComponentClassName
      ),
      addExport(
        featureModulePath,
        featureComponentImportPath,
        featureComponentClassName
      ),
    ]);
  };
}
