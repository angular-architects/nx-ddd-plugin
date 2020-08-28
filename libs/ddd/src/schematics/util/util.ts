import { strings } from '@angular-devkit/core';
import {
  chain,
  externalSchematic,
  Rule,
  Tree
} from '@angular-devkit/schematics';
import { getNpmScope } from '@nrwl/workspace';
import { UtilOptions } from './schema';

function validateInputs(options: UtilOptions): void {
  if (options.shared && options.domain) {
    throw new Error(`A utility library should either belong to a specific domain or be shared globally. 
      If you want to share a utility library across multiple specific domains, 
      consider using an API library. Hence, you should not provide the shared option in combination
      with the domain option.`);
  }

  if (!options.shared && !options.domain) {
    throw new Error(`A utilti library should either belong to a domain or be shared globally.
      Please provide either of these two options: --domain / --shared`);
  }
}

export default function (options: UtilOptions): Rule {
  return (host: Tree) => {
    validateInputs(options);

    const libName = `util-${strings.dasherize(options.name)}`;
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
        tags: `domain:${domain},type:util`,
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
