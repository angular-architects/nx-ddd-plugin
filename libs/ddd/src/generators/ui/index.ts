import { Tree, formatFiles } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/angular/generators';
import { UiOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';

export default async function (tree: Tree, options: UiOptions) {
  validateInputs(options);

  const libName = `ui-${strings.dasherize(options.name)}`;
  const domain = options.shared ? 'shared' : options.domain;
  const libDirectory = options.directory
    ? `${domain}/${options.directory}`
    : domain;
  const isPublishableLib = options.type === 'publishable';
  
  await libraryGenerator(tree, {
    name: libName,
    tags: `domain:${domain},type:ui`,
    prefix: options.name,
    publishable: isPublishableLib,
    buildable: options.type === 'buildable',
    directory: libDirectory,
    importPath: options.importPath
  });
  await formatFiles(tree);
}
