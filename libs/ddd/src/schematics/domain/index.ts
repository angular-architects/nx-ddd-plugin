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
  const libFolder = strings.dasherize(options.name);

  const templateSource = apply(url('./files'), [
    template({}),
    move(`libs/${libFolder}/domain/src/lib`),
  ]);

  const appFolderName = strings.dasherize(options.name);
  const appPath = `apps/${appFolderName}/src/app`;
  const appModulePath = `${appPath}/app.module.ts`;

  if (options.ngrx && !options.addApp) {
    throw new Error(
      `The 'ngrx' option may only be used when the 'addApp' option is used.`
    )
  }

  return chain([
    externalSchematic('@nrwl/angular', 'lib', {
      name: 'domain',
      directory: options.name,
      tags: `domain:${options.name},type:domain-logic`,
      style: 'scss',
      prefix: options.name,
      publishable: options.type === 'publishable',
      buildable: options.type === 'buildable',
    }),
    addDomainToLintingRules(options.name),
    mergeWith(templateSource),
    !options.addApp
      ? noop()
      : externalSchematic('@nrwl/angular', 'app', {
          name: options.name,
          tags: `domain:${options.name},type:app`,
          style: 'scss',
        }),
    options.addApp && options.ngrx
      ? chain([
          externalSchematic('@ngrx/schematics', 'store', {
            project: options.name,
            root: true,
            minimal: true,
            module: 'app.module.ts',
            name: 'state',
          }),
          addNgrxImportsToApp(appModulePath),
          addNgRxToPackageJson(),
        ])
      : noop(),
  ]);
}
