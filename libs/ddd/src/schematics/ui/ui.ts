import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
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

export default function(options: UiOptions): Rule {
  validateInputs(options);

  const libName = strings.dasherize(options.name);
  const domain = options.shared ? 'shared' : options.domain;
  const libDir = options.directory ? `${domain}/${options.directory}` : domain;

  return chain([
    externalSchematic('@nrwl/angular', 'lib', {
      name: `ui-${libName}`,
      directory: libDir,
      tags: `domain:${domain},type:ui`,
      style: 'scss',
      prefix: options.name,
      publishable: options.type === 'publishable',
      buildable: options.type === 'buildable'
    })
  ]);
}
