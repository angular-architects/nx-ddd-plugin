import { Tree, formatFiles } from '@nx/devkit';
import { libraryGenerator } from '@nx/angular/generators';
import { ApiOptions } from './schema';
import { strings } from '@angular-devkit/core';
import { validateInputs } from '../utils/validate-inputs';
import { deleteDefaultComponent } from '../utils/delete-default-component';

export default async function (tree: Tree, options: ApiOptions) {
  validateInputs(options);

  const libName = options.name
    ? `api-${strings.dasherize(options.name)}`
    : 'api';

  const domain = options.shared ? 'shared' : options.domain;
  const libDirectory = options.directory
    ? `${domain}/${options.directory}`
    : domain;
  const isPublishableLib = options.type === 'publishable';

  await libraryGenerator(tree, {
    name: libName,
    tags: `domain:${domain},domain:${domain}/${libName},type:api`,
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

  console.info(
    `\nHINT: Don\'t forget to extend the rules in your .eslintrc to allow selected domains to access this API.\nFor this, add the tag domain:${domain}/${libName} to the respective domains' rule sets.\n `
  );

  await formatFiles(tree);
}
