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
import { readWorkspaceName, readWorkspaceLayout } from '../utils';

export default function (options: FeatureOptions): Rule {
  return (host: Tree) => {
    const workspaceName = readWorkspaceName(host);
    const workspaceLayout = readWorkspaceLayout(host);

    const { libsDir, appsDir } = workspaceLayout;
    const domainFolderName = strings.dasherize(options.domain);
    const domainPath = `${libsDir}/${domainFolderName}/domain/src/lib`;
    const domainModulePath = `${domainPath}/${domainFolderName}-domain.module.ts`;
    const domainModuleClassName =
      strings.classify(options.domain) + 'DomainModule';
    const domainImportPath = `${workspaceName}/${domainFolderName}/domain`;
    const domainIndexPath = `${libsDir}/${domainFolderName}/domain/src/index.ts`;

    const featureName = strings.dasherize(options.name);
    const featureFolderName = (options.prefix ? 'feature-' : '') + featureName;
    const featurePath = `${libsDir}/${domainFolderName}/${featureFolderName}/src/lib`;
    const featureModulePath = `${featurePath}/${domainFolderName}-${featureFolderName}.module.ts`;
    const featureModuleClassName = strings.classify(
      `${options.domain}-${featureFolderName}Module`
    );
    const featureImportPath = `${workspaceName}/${domainFolderName}/${featureFolderName}`;
    const featureIndexPath = `${libsDir}/${domainFolderName}/${featureFolderName}/src/index.ts`;

    const entityName = options.entity ? strings.dasherize(options.entity) : '';

    const featureComponentImportPath = `./${featureName}.component`;
    const featureComponentClassName = strings.classify(
      `${featureName}Component`
    );

    const appName = options.app || options.domain;
    const appFolderName = strings.dasherize(appName);
    const appModulePath = `${appsDir}/${appFolderName}/src/app/app.module.ts`;

    if (options.app) {
      const requiredAppModulePath = `${appsDir}/${appFolderName}/src/app/app.module.ts`;
      if (!host.exists(requiredAppModulePath)) {
        throw new Error(
          `Specified app ${options.app} does not exist: ${requiredAppModulePath} expected!`
        );
      }
    }

    if (options.ngrx && !options.entity) {
      throw new Error(
        `The 'ngrx' option may only be used when the 'entity' option is used.`
      )
    }

    const domainTemplates =
      options.ngrx && options.entity
        ? apply(url('./files/forDomainWithNgrx'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(domainPath),
          ])
        : apply(url('./files/forDomain'), [
            filterTemplates(options),
            template({ ...strings, ...options, workspaceName }),
            move(domainPath),
          ]);

    const featureTemplates =
      options.ngrx && options.entity
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
        name: `feature-${options.name}`,
        directory: options.domain,
        tags: `domain:${options.domain},type:feature`,
        style: 'scss',
        prefix: options.domain,
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
      options.entity
        ? addTsExport(domainIndexPath, [
            `./lib/entities/${entityName}`,
            `./lib/infrastructure/${entityName}.data.service`,
          ])
        : noop(),
      options.ngrx && options.entity && host.exists(domainModulePath)
        ? chain([
            addNgRxToPackageJson(),
            addNgrxImportsToDomain(domainModulePath, entityName),
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
