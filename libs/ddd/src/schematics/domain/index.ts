import {
  chain,
  externalSchematic,
  Rule,
  apply,
  url,
  template,
  move,
  mergeWith,
  noop,
} from '@angular-devkit/schematics';

import { strings } from '@angular-devkit/core';
import { DomainOptions } from './schema';
import {
  addDomainToLintingRules,
  addNgrxImportsToApp,
  addNgRxToPackageJson,
} from '../rules';

export default function (options: DomainOptions): Rule {
  const libName = strings.dasherize(options.name);
  const appName = strings.dasherize(options.name);
  const libFolderPath = `libs/${libName}/${options.libsDirectory}`;
  const libLibFolder = `${libFolderPath}/domain/src/lib`;
  const appFolderPath = `apps/${appName}/${options.appsDirectory}`;
  const appModuleFolder = `${appFolderPath}/src/app`;
  const appModuleFilepath = `${appModuleFolder}/app.module.ts`;

  const templateSource = apply(url('./files'), [
    template({}),
    move(`${libLibFolder}`),
  ]);

  if (options.ngrx && !options.addApp) {
    throw new Error(
      `The 'ngrx' option may only be used when the 'addApp' option is used.`
    );
  }

  return chain([
    externalSchematic('@nrwl/angular', 'lib', {
      name: 'domain',
      directory: libFolderPath,
      tags: `domain:${libName},type:domain-logic`,
      style: 'scss',
      prefix: libName,
      publishable: options.type === 'publishable',
      buildable: options.type === 'buildable',
    }),
    addDomainToLintingRules(appName),
    mergeWith(templateSource),
    !options.addApp
      ? noop()
      : externalSchematic('@nrwl/angular', 'app', {
          name: options.name,
          tags: `domain:${appName},type:app`,
          style: 'scss',
        }),
    options.addApp && options.ngrx
      ? chain([
          externalSchematic('@ngrx/schematics', 'store', {
            project: appName,
            root: true,
            minimal: true,
            module: 'app.module.ts',
            name: 'state',
          }),
          addNgrxImportsToApp(appModuleFilepath),
          addNgRxToPackageJson(),
        ])
      : noop(),
  ]);
}
