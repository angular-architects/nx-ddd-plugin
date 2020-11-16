import { strings } from '@angular-devkit/core';
import {
  chain,
  externalSchematic,
  Rule,
  Tree,
} from '@angular-devkit/schematics';
import { getNpmScope } from '@nrwl/workspace';
import { validateInputs } from '../utils';
import { UtilOptions } from './schema';

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
