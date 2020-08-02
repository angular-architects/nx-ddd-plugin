import { strings } from '@angular-devkit/core';
import {
  chain,
  externalSchematic,
  Rule,
  Tree
} from '@angular-devkit/schematics';
import { getNpmScope } from '@nrwl/workspace';
import { UiOptions } from './schema';

function validateInputs(options: UiOptions): void {
  if (options.shared && options.domain) {
    throw new Error(`A UI library should either belong to a specific domain or be shared globally. 
      If you want to share a UI library across multiple specific domains, 
      consider using an API library. Hence, you should not provide the shared option in combination
      with the domain option.`);
  }

  if (!options.shared && !options.domain) {
    throw new Error(`A UI library should either belong to a domain or be shared globally.
      Please provide either of these two options: --domain / --shared`);
  }
}

export default function (options: UiOptions): Rule {
  return (host: Tree) => {
    validateInputs(options);

    const libName = `ui-${strings.dasherize(options.name)}`;
    const domain = options.shared ? 'shared' : options.domain;
    const libDirectory = options.directory
      ? `${domain}/${options.directory}`
      : domain;
    const isPublishableLib = options.type === 'publishable';
    const npmScope = getNpmScope(host);
    const projectName = `${libDirectory}-${libName}`.replace(
      new RegExp('/', 'g'),
      '-'
    );
    const importPath = isPublishableLib
      ? `@${npmScope}/${projectName}`
      : undefined;

    return chain([
      externalSchematic('@nrwl/angular', 'lib', {
        name: libName,
        tags: `domain:${domain},type:ui`,
        style: 'scss',
        prefix: options.name,
        publishable: isPublishableLib,
        buildable: options.type === 'buildable',
        directory: libDirectory,
        importPath,
      }),
    ]);
  };
}
