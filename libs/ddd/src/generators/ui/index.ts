import { Tree, formatFiles } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { UiOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';
import { deleteDefaultComponent } from '../utils/delete-default-component';

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
    importPath: options.importPath,
    standalone: options.standalone,
  });

  deleteDefaultComponent(
    tree,
    libDirectory,
    libName,
    options.name
  );

  await formatFiles(tree);
}
